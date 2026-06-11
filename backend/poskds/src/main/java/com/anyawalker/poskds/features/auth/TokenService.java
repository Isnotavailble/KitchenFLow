package com.anyawalker.poskds.features.auth;

import com.anyawalker.poskds.features.auth.dtos.TokenResponse;
import com.anyawalker.poskds.models.entities.Token;
import com.anyawalker.poskds.models.entities.User;
import com.anyawalker.poskds.repos.TokenRepo;
import com.nimbusds.jose.JWSHeader;
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
    public TokenResponse generateTokens(User user) {
        // Enforce single-device login constraint by deleting any existing session
        tokenRepo.findByUserId(user.getId()).ifPresent(existingToken -> {
            tokenRepo.delete(existingToken);
        });

        // Generate stateless JWT access token
        String accessToken = generateAccessToken(user);

        // Create stateful UUID refresh token in database (valid for 7 days)
        Token token = new Token();
        token.setUser(user);
        token.setAccessToken(accessToken);
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(1));

        // Save session (UUID generated automatically by JPA)
        Token savedToken = tokenRepo.save(token);

        return new TokenResponse(accessToken, savedToken.getRefreshToken());
    }

    @Transactional
    public TokenResponse refreshAccessToken(String refreshToken) {
        Token token = tokenRepo.findById(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token."));

        if (LocalDateTime.now().isAfter(token.getExpiresAt())) {
            tokenRepo.delete(token); // Cleanup expired token
            throw new RuntimeException("Refresh token has expired. Please login again.");
        }

        // Generate a new access token
        String newAccessToken = generateAccessToken(token.getUser());

        // Update active session with the new access token
        token.setAccessToken(newAccessToken);
        tokenRepo.save(token);

        return new TokenResponse(newAccessToken, token.getRefreshToken());
    }

    @Transactional
    public void revokeToken(String refreshToken) {
        tokenRepo.deleteById(refreshToken);
    }

    private String generateAccessToken(User user) {
        Instant now = Instant.now();
        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();
        
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("poskds-backend")
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.MINUTES))
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole()) // Set mapped authorities (role and actions)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader,claims)).getTokenValue();
    }
}
