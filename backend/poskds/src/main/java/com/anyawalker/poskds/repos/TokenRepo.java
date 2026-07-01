package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.entities.TokenEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepo extends JpaRepository<@NonNull TokenEntity,@NonNull Long> {

    @Query(value = """
            SELECT * FROM tokens
            WHERE user_id = :userId AND revoked = :isRevoked
            """,nativeQuery = true)
    List<TokenEntity> findByUserIdAndIsRevoked(@Param("userId") Long userId,
                                               @Param("isRevoked") boolean isRevoked);
    @Query(value = """
            SELECT * FROM tokens WHERE user_id = :userId
            """,nativeQuery = true)
    List<TokenEntity> findByUserId(@Param("userId") Long userId);

    @Modifying
    @Query(value = "DELETE FROM tokens WHERE user_id = :userId",nativeQuery = true)
    void deleteByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM tokens WHERE token_hash = :tokenHash",nativeQuery = true)
    Optional<TokenEntity> findByRefreshToken(@Param("tokenHash") String tokenHash);
}
