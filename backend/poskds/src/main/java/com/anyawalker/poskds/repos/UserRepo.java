package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.UserEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<@NonNull UserEntity, @NonNull Long> {

    Optional<UserEntity> findByMobileNumber(String mobileNumber);

    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByMobileNumberAndIdNot(String mobileNumber, Long id);

    List<UserEntity> findByIsDeleted(boolean isDeleted);

    List<UserEntity> findByRole(String role);

    List<UserEntity> findByRoleAndIsDeleted(String role, boolean isDeleted);
}

