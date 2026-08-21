package com.anyawalker.poskds.features.account;

import com.anyawalker.poskds.features.account.dtos.AccountDto;
import com.anyawalker.poskds.features.account.exceptions.AccountNotFoundException;
import com.anyawalker.poskds.features.account.exceptions.InvalidAccountOperationException;
import com.anyawalker.poskds.features.account.exceptions.MobileAlreadyExistsException;
import com.anyawalker.poskds.models.UserEntity;
import com.anyawalker.poskds.repos.TokenRepo;
import com.anyawalker.poskds.repos.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.util.List;

@Service
public class AccountService {
    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final UserRepo userRepo;
    private final TokenRepo tokenRepo;
    private final PasswordEncoder passwordEncoder;

    public AccountService(UserRepo userRepo, TokenRepo tokenRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AccountDto.Response> getAllAccounts() {
        return userRepo.findAll()
                .stream()
                .map(AccountDto.Response::fromEntity)
                .toList();
    }

    public AccountDto.Response getAccountById(Long id) {
        UserEntity user = userRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));
        return AccountDto.Response.fromEntity(user);
    }

    @Transactional
    public AccountDto.Response createAccount(AccountDto.CreateRequest request) {
        String mobileNumber = request.mobileNumber().trim();

        if (userRepo.existsByMobileNumber(mobileNumber)) {
            throw new MobileAlreadyExistsException("Mobile number already registered: " + mobileNumber);
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        String role = request.role().trim().toUpperCase();
        UserEntity entity = request.toEntity(encodedPassword, role);
        UserEntity saved = userRepo.save(entity);

        log.info("Created new account id={} with role={}", saved.getId(), saved.getRole());
        return AccountDto.Response.fromEntity(saved);
    }

    @Transactional
    public AccountDto.Response updateAccount(Long id, AccountDto.UpdateRequest request) {
        UserEntity user = userRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));

        String mobileNumber = request.mobileNumber().trim();
        String role = request.role().trim().toUpperCase();

        if (userRepo.existsByMobileNumberAndIdNot(mobileNumber, id)) {
            throw new MobileAlreadyExistsException("Mobile number already used by another account: " + mobileNumber);
        }

        boolean credentialsOrRoleChanged = false;

        if (!user.getRole().equals(role)) {
            user.setRole(role);
            credentialsOrRoleChanged = true;
        }

        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
            credentialsOrRoleChanged = true;
        }

        user.setUsername(request.name().trim());
        user.setMobileNumber(mobileNumber);

        UserEntity saved = userRepo.save(user);

        // If credentials or roles changed, revoke all existing sessions to enforce security
        if (credentialsOrRoleChanged) {
            tokenRepo.deleteByUserId(id);
            log.info("Revoked active tokens for account id={} due to credentials/role change", id);
        }

        return AccountDto.Response.fromEntity(saved);
    }

    @Transactional
    public AccountDto.Response deactivateAccount(Long id, Long currentAdminId) {
        if (id.equals(currentAdminId)) {
            throw new InvalidAccountOperationException("Admins cannot deactivate their own account");
        }

        UserEntity user = userRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));

        user.setDeleted(true);
        UserEntity saved = userRepo.save(user);

        // Immediately revoke all active tokens
        tokenRepo.deleteByUserId(id);
        log.info("Deactivated account id={} and purged active sessions", id);

        return AccountDto.Response.fromEntity(saved);
    }

    @Transactional
    public AccountDto.Response reactivateAccount(Long id) {
        UserEntity user = userRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));

        user.setDeleted(false);
        UserEntity saved = userRepo.save(user);
        log.info("Reactivated account id={}", id);

        return AccountDto.Response.fromEntity(saved);
    }

    @Transactional
    public void changePassword(Long id, String newPassword) {
        UserEntity user = userRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        // Purge tokens so the user is forced to authenticate with new password
        tokenRepo.deleteByUserId(id);
        log.info("Changed password and revoked sessions for account id={}", id);
    }
}
