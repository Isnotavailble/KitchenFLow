package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.entities.Token;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TokenRepo extends JpaRepository<@NonNull Token,@NonNull String> {

    Optional<Token> findByUserId(Long userId);
}
