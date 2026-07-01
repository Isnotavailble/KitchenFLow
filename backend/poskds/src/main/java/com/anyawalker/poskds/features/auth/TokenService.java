package com.anyawalker.poskds.features.auth;

import com.anyawalker.poskds.features.auth.dtos.TokenResponse;
import com.anyawalker.poskds.features.auth.exceptions.InvalidRefreshTokenException;
import com.anyawalker.poskds.features.auth.exceptions.TooEarlyException;
import com.anyawalker.poskds.models.TokenEntity;
import com.anyawalker.poskds.models.UserEntity;
import com.anyawalker.poskds.repos.TokenRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class TokenService {

    @Autowired
    private TokenRepo tokenRepo;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Transactional
    public TokenResponse generateTokens(UserEntity userEntity) {
        Long userId = userEntity.getId();

        //delete all the token
        tokenRepo.deleteByUserId(userId);
        tokenRepo.flush();

        // Generate stateless JWT access token
        String accessToken = generateAccessToken(userEntity);
        String refreshToken = UUID.randomUUID().toString();
        String hashedRefreshToken = hashToken(refreshToken);

        // Create stateful UUID refresh token in database (valid for 7 days)
        //mental model : refresh Token ( for frontend )  > access token (for backend)
        TokenEntity tokenEntity = new TokenEntity();
        tokenEntity.setUserEntity(userEntity);
        tokenEntity.setTokenHash(hashedRefreshToken);
        tokenEntity.setExpiresAt(LocalDateTime.now().plusHours(1));

        // Save session (UUID generated automatically by JPA)
        tokenRepo.save(tokenEntity);

        return new TokenResponse(accessToken, refreshToken);
    }

    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public TokenResponse refreshAccessToken(String refreshToken) {
        String hashToken = hashToken(refreshToken);
        TokenEntity tokenEntity = tokenRepo.findByRefreshToken(hashToken)
                .orElseThrow(() -> new InvalidRefreshTokenException("Invalid refresh token."));

        // hibernate will call the select * from users where id = :id
        Long userId = tokenEntity.getUserEntity().getId();

        //token reused detection
        //if detected,destroy all the token by userId
        if (tokenEntity.isRevoked()){
            tokenRepo.deleteByUserId(userId);
            throw new InvalidRefreshTokenException("The token is already revoked.Please login again to verify yourself");
        }
        else if (LocalDateTime.now().isAfter(tokenEntity.getExpiresAt())) {
            tokenRepo.deleteByUserId(userId);
            throw new InvalidRefreshTokenException("Refresh token has expired. Please login again.");
        }
        //rule : frontend is forced to refresh only right before 30seconds before expires!
        else if (LocalDateTime.now().isBefore(tokenEntity.getCreatedAt().plusSeconds(30))){
            throw new TooEarlyException("Too early to be refreshed");
        }

        // Generate a new access/refresh token
        TokenEntity newTokenEntity = new TokenEntity();

        String newAccessToken = generateAccessToken(tokenEntity.getUserEntity());
        String newRefreshToken = UUID.randomUUID().toString();

        //create new Token
        newTokenEntity.setUserEntity(tokenEntity.getUserEntity());
        newTokenEntity.setTokenHash(hashToken(newRefreshToken));
        newTokenEntity.setExpiresAt(LocalDateTime.now().plusHours(1));
        //revoke the old one
        tokenEntity.setRevoked(true);

        //note : we don't need to call the .save for old one
        // because the old entity hibernate proxy is not dead yet in this scope
        tokenRepo.save(newTokenEntity);
        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    //may be for logout
    @Transactional
    public void revokeToken(String refreshToken) {

        TokenEntity tokenEntity = tokenRepo.findByRefreshToken(hashToken(refreshToken))
                .orElseThrow(() -> new InvalidRefreshTokenException("Fail to revoke the refresh token"));
        tokenEntity.setRevoked(true);
    }

    private String generateAccessToken(UserEntity userEntity) {
        Instant now = Instant.now();
        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("poskds-backend")
                .issuedAt(now)
                .expiresAt(now.plus(15, ChronoUnit.MINUTES))
                .subject(userEntity.getMobileNumber())
                .claim("userId", userEntity.getId())
                // we need to remove the prefix because jwtAuthoritiesConverter will generate the converter on fly
                .claim("role", userEntity.getRole().replace("ROLE_",""))
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader,claims)).getTokenValue();
    }

    public static String hashToken(String plainToken) {
        try {
            // ၁။ Java Standard Security package ကနေ SHA-256 အား ခေါ်ယူခြင်း
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            // ၂။ String အား String bytes များအဖြစ် ပြောင်းလဲပြီး Hash တွက်ချက်ခြင်း
            byte[] hashBytes = digest.digest(plainToken.getBytes(StandardCharsets.UTF_8));

            // ၃။ Java 17+ / Java 21 ရဲ့ Built-in HexFormat ကို သုံးပြီး Hex String (64 chars) ပြောင်းလဲခြင်း
            return HexFormat.of().formatHex(hashBytes);

        } catch (NoSuchAlgorithmException e) {
            // SHA-256 က JVM တိုင်းမှာ ၁၀၀% မဖြစ်မနေ ပါဝင်ပြီးသားမို့လို့
            // ဒီ Exception က လက်တွေ့မှာ ဘယ်တော့မှ တက်လာမှာ မဟုတ်ပါဘူး
            throw new IllegalStateException("SHA-256 algorithm is missing in this JVM", e);
        }
    }
}
