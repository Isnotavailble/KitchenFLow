package com.anyawalker.poskds.features.auth;

import com.anyawalker.poskds.features.auth.dtos.LoginRequest;
import com.anyawalker.poskds.features.auth.dtos.LoginResponse;
import com.anyawalker.poskds.features.auth.dtos.TokenResponse;
import com.anyawalker.poskds.models.entities.UserEntity;
import com.anyawalker.poskds.repos.UserRepo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class AuthService {
    UserRepo userRepo;
    TokenService tokenService;

    public AuthService(UserRepo userRepo, TokenService tokenService) {
        this.userRepo = userRepo;
        this.tokenService = tokenService;
    }

    @Transactional
    public LoginResponse doLogin(String email) {

        UserEntity userEntity = userRepo.findByEmail(email).orElse(null);
        if (userEntity == null)
            return null;
        //generate new token
        TokenResponse tokenResponse = tokenService.generateTokens(userEntity);
        return new LoginResponse(
                userEntity.getId(),
                userEntity.getUsername(),
                userEntity.getEmail(),
                userEntity.getRole(),
                tokenResponse);
    }

    public TokenResponse doRefreshToken(String refreshToken) {
        return tokenService.refreshAccessToken(refreshToken);
    }
}
