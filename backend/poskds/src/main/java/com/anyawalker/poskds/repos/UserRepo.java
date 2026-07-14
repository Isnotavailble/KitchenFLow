package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.UserEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository< @NonNull  UserEntity,@NonNull Long> {

    Optional<UserEntity> findByMobileNumber(String email);
}
