package com.anyawalker.poskds.features.account;

import com.anyawalker.poskds.features.account.exceptions.AccountNotFoundException;
import com.anyawalker.poskds.features.account.exceptions.InvalidAccountOperationException;
import com.anyawalker.poskds.features.account.exceptions.MobileAlreadyExistsException;
import com.anyawalker.poskds.features.account.utils.AccountDtoValidator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import static com.anyawalker.poskds.features.account.dtos.AccountDto.*;

@RestController
@RequestMapping("api/accounts")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<?> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAccountById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid account ID"));
        }
        try {
            Response account = accountService.getAccountById(id);
            return ResponseEntity.ok(account);
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody CreateRequest request) {
        String validationError = AccountDtoValidator.validateCreatePayload(request);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }


        try {
            Response created = accountService.createAccount(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (MobileAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(
            @PathVariable Long id,
            @RequestBody UpdateRequest request
    ) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid account ID"));
        }

        String validationError = AccountDtoValidator.validateUpdatePayload(request);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        try {
            Response updated = accountService.updateAccount(id, request);
            return ResponseEntity.ok(updated);
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (MobileAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid account ID"));
        }

        try {
            Long currentAdminId = jwt != null ? jwt.getClaim("userId") : null;
            Response deactivated = accountService.deactivateAccount(id, currentAdminId);
            return ResponseEntity.ok(deactivated);
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (InvalidAccountOperationException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateAccount(@PathVariable Long id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid account ID"));
        }

        try {
            Response reactivated = accountService.reactivateAccount(id);
            return ResponseEntity.ok(reactivated);
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request
    ) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid account ID"));
        }

        String validationError = AccountDtoValidator.validateChangePasswordPayload(request);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        try {
            accountService.changePassword(id, request.newPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully and active sessions revoked"));
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
