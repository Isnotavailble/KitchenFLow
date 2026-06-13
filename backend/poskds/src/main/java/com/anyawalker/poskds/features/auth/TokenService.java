package com.anyawalker.poskds.features.auth;

import com.anyawalker.poskds.features.auth.dtos.TokenResponse;
import com.anyawalker.poskds.features.auth.exceptions.InvalidRefreshTokenException;
import com.anyawalker.poskds.features.auth.exceptions.TooEarlyException;
import com.anyawalker.poskds.models.entities.TokenEntity;
import com.anyawalker.poskds.models.entities.UserEntity;
import com.anyawalker.poskds.repos.TokenRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class TokenService {

    @Autowired
    private TokenRepo tokenRepo;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Transactional
    public TokenResponse generateTokens(UserEntity userEntity) {

        TokenEntity existingTokenEntity = userEntity.getToken();
        if (existingTokenEntity != null){
            userEntity.setToken(null);
            tokenRepo.flush();
        }

        // Generate stateless JWT access token
        String accessToken = generateAccessToken(userEntity);

        // Create stateful UUID refresh token in database (valid for 7 days)
        //mental model : refresh Token ( for frontend )  > access token (for backend)
        TokenEntity tokenEntity = new TokenEntity();
        tokenEntity.setUser(userEntity);
        tokenEntity.setAccessToken(accessToken);
        tokenEntity.setCreatedAt(LocalDateTime.now());
        tokenEntity.setExpiresAt(LocalDateTime.now().plusHours(1));

        // Save session (UUID generated automatically by JPA)
        TokenEntity savedTokenEntity = tokenRepo.save(tokenEntity);

        return new TokenResponse(accessToken, savedTokenEntity.getRefreshToken());
    }

    @Transactional
    public TokenResponse refreshAccessToken(String refreshToken) {
        TokenEntity tokenEntity = tokenRepo.findById(refreshToken)
                .orElseThrow(() -> new InvalidRefreshTokenException("Invalid refresh token."));

        if (LocalDateTime.now().isAfter(tokenEntity.getExpiresAt())) {
            tokenRepo.delete(tokenEntity); // Cleanup expired token
            throw new InvalidRefreshTokenException("Refresh token has expired. Please login again.");
        }
        //rule : frontend is forced to refresh only right before 30seconds before expires!
        else if (LocalDateTime.now().isBefore(tokenEntity.getCreatedAt().plusSeconds(30))){
            throw new TooEarlyException("Too early to be refreshed");
        }
        else if (tokenEntity.getUpdatedAt() != null && LocalDateTime.now().isBefore(tokenEntity.getUpdatedAt().plusSeconds(30))){
            throw new TooEarlyException("Too early to be refreshed");
        }
        // Generate a new access token
        String newAccessToken = generateAccessToken(tokenEntity.getUser());

        // Update active session with the new access token
        tokenEntity.setAccessToken(newAccessToken);
        tokenEntity.setUpdatedAt(LocalDateTime.now());
        tokenRepo.save(tokenEntity);

        return new TokenResponse(newAccessToken, tokenEntity.getRefreshToken());
    }

    @Transactional
    public void revokeToken(String refreshToken) {
        tokenRepo.deleteById(refreshToken);
    }

    private String generateAccessToken(UserEntity userEntity) {
        Instant now = Instant.now();
        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("poskds-backend")
                .issuedAt(now)
                .expiresAt(now.plus(15, ChronoUnit.MINUTES))
                .subject(userEntity.getEmail())
                .claim("userId", userEntity.getId())
                // we need to remove the prefix because jwtAuthoritiesConverter will generate the converter on fly
                .claim("role", userEntity.getRole().replace("ROLE_",""))
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader,claims)).getTokenValue();
    }
}
