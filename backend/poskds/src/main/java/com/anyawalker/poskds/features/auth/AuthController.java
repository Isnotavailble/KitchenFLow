package com.anyawalker.poskds.features.auth;

import com.anyawalker.poskds.features.auth.dtos.LoginRequest;
import com.anyawalker.poskds.features.auth.dtos.LoginResponse;
import com.anyawalker.poskds.features.auth.dtos.TokenResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService){
        this.authService = authService;
    }
    @PostMapping("/login")
    public ResponseEntity<?> doLogin(Authentication authentication){
        String email = authentication.getName();
        LoginResponse loginResponse = authService.doLogin(email);

        return ResponseEntity.ok(loginResponse);
    }


}
