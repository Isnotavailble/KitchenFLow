package com.anyawalker.poskds.features.account.dtos;

import com.anyawalker.poskds.models.UserEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class AccountDto {

    public record Response(
            Long id,
            String name,
            String mobileNumber,
            String role,
            boolean isDeleted,
            Instant createdAt,
            Instant updatedAt
    ) {
        public static Response fromEntity(UserEntity entity) {
            return new Response(
                    entity.getId(),
                    entity.getUsername(),
                    entity.getMobileNumber(),
                    entity.getRole(),
                    entity.isDeleted(),
                    entity.getCreatedAt(),
                    entity.getUpdatedAt()
            );
        }
    }

    public record CreateRequest(
            String name,
            String mobileNumber,
            String password,
            String role
    ) {
        public UserEntity toEntity(String encodedPassword, String normalizedRole) {
            UserEntity entity = new UserEntity();
            entity.setUsername(this.name.trim());
            entity.setMobileNumber(this.mobileNumber.trim());
            entity.setPassword(encodedPassword);
            entity.setRole(normalizedRole);
            entity.setDeleted(false);
            return entity;
        }
    }

    public record UpdateRequest(
            String name,
            String mobileNumber,
            String role,
            String password
    ) {
    }

    public record ChangePasswordRequest(
            String newPassword
    ) {
    }
}
