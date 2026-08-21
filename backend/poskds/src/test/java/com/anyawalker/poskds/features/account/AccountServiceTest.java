package com.anyawalker.poskds.features.account;

import com.anyawalker.poskds.features.account.dtos.AccountDto;
import com.anyawalker.poskds.features.account.exceptions.AccountNotFoundException;
import com.anyawalker.poskds.features.account.exceptions.InvalidAccountOperationException;
import com.anyawalker.poskds.features.account.exceptions.MobileAlreadyExistsException;
import com.anyawalker.poskds.models.UserEntity;
import com.anyawalker.poskds.repos.TokenRepo;
import com.anyawalker.poskds.repos.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AccountServiceTest {

    @Mock
    private UserRepo userRepo;

    @Mock
    private TokenRepo tokenRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AccountService accountService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllAccounts_ShouldReturnAllAccounts() {
        UserEntity user1 = new UserEntity();
        user1.setId(1L);
        user1.setUsername("Alice");
        user1.setMobileNumber("09111111111");
        user1.setRole("ROLE_CASHIER");
        user1.setDeleted(false);

        UserEntity user2 = new UserEntity();
        user2.setId(2L);
        user2.setUsername("Bob");
        user2.setMobileNumber("09222222222");
        user2.setRole("ROLE_CHEF");
        user2.setDeleted(false);

        when(userRepo.findAll()).thenReturn(List.of(user1, user2));

        List<AccountDto.Response> results = accountService.getAllAccounts();

        assertEquals(2, results.size());
        assertEquals("Alice", results.get(0).name());
        assertEquals("ROLE_CASHIER", results.get(0).role());
        verify(userRepo, times(1)).findAll();
    }

    @Test
    void getAccountById_WhenExists_ShouldReturnAccount() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setUsername("Alice");
        user.setMobileNumber("09111111111");
        user.setRole("ROLE_CASHIER");

        when(userRepo.findById(1L)).thenReturn(Optional.of(user));

        AccountDto.Response response = accountService.getAccountById(1L);

        assertNotNull(response);
        assertEquals("Alice", response.name());
        assertEquals("09111111111", response.mobileNumber());
    }

    @Test
    void getAccountById_WhenNotFound_ShouldThrowAccountNotFoundException() {
        when(userRepo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> accountService.getAccountById(99L));
    }

    @Test
    void createAccount_WithValidData_ShouldCreateSuccessfully() {
        AccountDto.CreateRequest request = new AccountDto.CreateRequest(
                "John Cashier", "09555555555", "Password123#", "ROLE_CASHIER");

        when(userRepo.existsByMobileNumber("09555555555")).thenReturn(false);
        when(passwordEncoder.encode("Password123#")).thenReturn("encodedPassword");

        UserEntity savedUser = new UserEntity();
        savedUser.setId(10L);
        savedUser.setUsername("John Cashier");
        savedUser.setMobileNumber("09555555555");
        savedUser.setPassword("encodedPassword");
        savedUser.setRole("ROLE_CASHIER");
        savedUser.setDeleted(false);

        when(userRepo.save(any(UserEntity.class))).thenReturn(savedUser);

        AccountDto.Response response = accountService.createAccount(request);

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals("John Cashier", response.name());
        assertEquals("ROLE_CASHIER", response.role());
        assertFalse(response.isDeleted());
        verify(userRepo, times(1)).save(any(UserEntity.class));
    }

    @Test
    void createAccount_WhenMobileAlreadyExists_ShouldThrowMobileAlreadyExistsException() {
        AccountDto.CreateRequest request = new AccountDto.CreateRequest(
                "Duplicate User", "09111111111", "Password123#", "ROLE_CASHIER");

        when(userRepo.existsByMobileNumber("09111111111")).thenReturn(true);

        assertThrows(MobileAlreadyExistsException.class, () -> accountService.createAccount(request));
        verify(userRepo, never()).save(any());
    }

    @Test
    void updateAccount_WhenRoleChanges_ShouldRevokeActiveSessions() {
        AccountDto.UpdateRequest request = new AccountDto.UpdateRequest(
                "Alice Promoted", "09111111111", "ROLE_ADMIN", null);

        UserEntity existing = new UserEntity();
        existing.setId(1L);
        existing.setUsername("Alice");
        existing.setMobileNumber("09111111111");
        existing.setRole("ROLE_CASHIER");

        when(userRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepo.existsByMobileNumberAndIdNot("09111111111", 1L)).thenReturn(false);
        when(userRepo.save(existing)).thenReturn(existing);

        AccountDto.Response response = accountService.updateAccount(1L, request);

        assertEquals("Alice Promoted", response.name());
        assertEquals("ROLE_ADMIN", response.role());
        verify(tokenRepo, times(1)).deleteByUserId(1L);
    }

    @Test
    void updateAccount_WhenMobileConflict_ShouldThrowMobileAlreadyExistsException() {
        AccountDto.UpdateRequest request = new AccountDto.UpdateRequest(
                "Alice", "09222222222", "ROLE_CASHIER", null);

        UserEntity existing = new UserEntity();
        existing.setId(1L);

        when(userRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepo.existsByMobileNumberAndIdNot("09222222222", 1L)).thenReturn(true);

        assertThrows(MobileAlreadyExistsException.class, () -> accountService.updateAccount(1L, request));
        verify(userRepo, never()).save(any());
    }

    @Test
    void deactivateAccount_WhenTargetIsNotCurrentAdmin_ShouldDeactivateAndPurgeTokens() {
        UserEntity target = new UserEntity();
        target.setId(5L);
        target.setUsername("Chef Gordon");
        target.setRole("ROLE_CHEF");
        target.setDeleted(false);

        when(userRepo.findById(5L)).thenReturn(Optional.of(target));
        when(userRepo.save(target)).thenReturn(target);

        AccountDto.Response response = accountService.deactivateAccount(5L, 1L);

        assertTrue(response.isDeleted());
        verify(tokenRepo, times(1)).deleteByUserId(5L);
    }

    @Test
    void deactivateAccount_WhenTargetIsCurrentAdmin_ShouldThrowInvalidAccountOperationException() {
        assertThrows(InvalidAccountOperationException.class,
                () -> accountService.deactivateAccount(1L, 1L));

        verify(userRepo, never()).save(any());
        verify(tokenRepo, never()).deleteByUserId(any());
    }

    @Test
    void reactivateAccount_ShouldSetIsDeletedFalse() {
        UserEntity target = new UserEntity();
        target.setId(5L);
        target.setUsername("Chef Gordon");
        target.setDeleted(true);

        when(userRepo.findById(5L)).thenReturn(Optional.of(target));
        when(userRepo.save(target)).thenReturn(target);

        AccountDto.Response response = accountService.reactivateAccount(5L);

        assertFalse(response.isDeleted());
        verify(userRepo, times(1)).save(target);
    }

    @Test
    void changePassword_ShouldUpdatePasswordAndRevokeTokens() {
        UserEntity user = new UserEntity();
        user.setId(2L);
        user.setPassword("oldEncoded");

        when(userRepo.findById(2L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewSecret123#")).thenReturn("newEncoded");

        accountService.changePassword(2L, "NewSecret123#");

        assertEquals("newEncoded", user.getPassword());
        verify(userRepo, times(1)).save(user);
        verify(tokenRepo, times(1)).deleteByUserId(2L);
    }
}
