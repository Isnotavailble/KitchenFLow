package com.anyawalker.poskds.features.auth;

import com.anyawalker.poskds.features.auth.dtos.LoginRequest;
import com.anyawalker.poskds.features.auth.dtos.LoginResponse;
import com.anyawalker.poskds.features.auth.exceptions.InvalidRefreshTokenException;
import com.anyawalker.poskds.features.auth.exceptions.TooEarlyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("api/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    public AuthController(AuthService authService, AuthenticationManager authenticationManager){
        this.authService = authService;
        this.authenticationManager = authenticationManager;
    }
    @PostMapping("/login")
    public ResponseEntity<?> doLogin(@RequestBody LoginRequest loginRequest){
        try {
            //custom authentication with DaoAuthenticationManager
            Authentication unauthenticatedRequest = UsernamePasswordAuthenticationToken
                    .unauthenticated(loginRequest.mobileNumber(), loginRequest.password());
            Authentication authenticatedRequest = authenticationManager.authenticate(unauthenticatedRequest);
            //saving user and token into db (service)
            LoginResponse loginResponse = authService.doLogin(loginRequest.mobileNumber());
            return ResponseEntity.ok(loginResponse);

        }
        catch (AuthenticationException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status","fail to authenticate"));
        }
    }
    @PostMapping("/refresh")
    public ResponseEntity<?> doRefreshToken(@RequestBody Map<String, String> refreshToken) {
        try {
            String currentRefreshToken = refreshToken.get("refresh_token");
            return ResponseEntity.ok(authService.doRefreshToken(currentRefreshToken));
        }
        catch (AuthenticationException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status","fail to authenticate"));
        }
        //avoid using invalid token or outdated refreshToken to be refresh
        catch (InvalidRefreshTokenException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", e.getMessage()));
        }
        //avoid too early refresh
        catch (TooEarlyException e){
            return ResponseEntity
                    .ok(Map.of("status",e.getMessage()));
        }
    }

}
