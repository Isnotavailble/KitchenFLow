package com.anyawalker.poskds.features.account.utils;

import com.anyawalker.poskds.features.account.dtos.AccountDto.ChangePasswordRequest;
import com.anyawalker.poskds.features.account.dtos.AccountDto.CreateRequest;
import com.anyawalker.poskds.features.account.dtos.AccountDto.UpdateRequest;

import java.util.Set;
import java.util.regex.Pattern;

public class AccountDtoValidator {

    private static final Set<String> VALID_ROLES = Set.of("ROLE_ADMIN", "ROLE_CASHIER", "ROLE_CHEF");
    private static final Pattern MOBILE_PATTERN = Pattern.compile("^[0-9+]{8,20}$");

    //prevent object creation for this class
    //purpose : this class is a static class so no need to create another object in runtime
    private AccountDtoValidator() {}

    public static String validateCreatePayload(CreateRequest request) {
        if (request == null) {
            return "Request body cannot be null";
        }
        if (request.name() == null || request.name().isBlank()) {
            return "Name cannot be blank";
        }
        String trimmedName = request.name().trim();
        if (trimmedName.length() < 2 || trimmedName.length() > 120) {
            return "Name must be between 2 and 120 characters";
        }
        if (request.mobileNumber() == null || request.mobileNumber().isBlank()) {
            return "Mobile number cannot be blank";
        }
        String trimmedMobile = request.mobileNumber().trim();
        if (!MOBILE_PATTERN.matcher(trimmedMobile).matches()) {
            return "Invalid mobile number format";
        }
        if (request.password() == null || request.password().isBlank()) {
            return "Password cannot be blank";
        }
        if (request.password().length() < 8 || request.password().length() > 100) {
            return "Password must be between 8 and 100 characters";
        }
        if (request.role() == null || request.role().isBlank()) {
            return "Role cannot be blank";
        }
        if (!VALID_ROLES.contains(request.role().trim().toUpperCase())) {
            return "Invalid role: " + request.role();
        }
        return null;
    }

    public static String validateUpdatePayload(UpdateRequest request) {
        if (request == null) {
            return "Request body cannot be null";
        }
        if (request.name() == null || request.name().isBlank()) {
            return "Name cannot be blank";
        }
        String trimmedName = request.name().trim();
        if (trimmedName.length() < 2 || trimmedName.length() > 120) {
            return "Name must be between 2 and 120 characters";
        }
        if (request.mobileNumber() == null || request.mobileNumber().isBlank()) {
            return "Mobile number cannot be blank";
        }
        String trimmedMobile = request.mobileNumber().trim();
        if (!MOBILE_PATTERN.matcher(trimmedMobile).matches()) {
            return "Invalid mobile number format";
        }
        if (request.role() == null || request.role().isBlank()) {
            return "Role cannot be blank";
        }
        if (!VALID_ROLES.contains(request.role().trim().toUpperCase())) {
            return "Invalid role: " + request.role();
        }
        if (request.password() != null && !request.password().isBlank()) {
            if (request.password().length() < 8 || request.password().length() > 100) {
                return "Password must be between 8 and 100 characters";
            }
        }
        return null;
    }

    public static String validateChangePasswordPayload(ChangePasswordRequest request) {
        if (request == null || request.newPassword() == null || request.newPassword().isBlank()) {
            return "New password cannot be blank";
        }
        if (request.newPassword().length() < 8 || request.newPassword().length() > 100) {
            return "New password must be between 8 and 100 characters";
        }
        return null;
    }
}
