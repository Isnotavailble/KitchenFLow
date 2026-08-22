package com.anyawalker.poskds.features.auth;

import com.anyawalker.poskds.models.UserEntity;
import com.anyawalker.poskds.repos.UserRepo;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class UserAccountStatusFilter extends OncePerRequestFilter {

    private final UserRepo userRepo;

    public UserAccountStatusFilter(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof Jwt jwt) {
            Long userId = jwt.getClaim("userId");
            String tokenRole = jwt.getClaim("role");

            if (userId != null) {
                Optional<UserEntity> userOptional = userRepo.findById(userId);

                if (userOptional.isEmpty() || userOptional.get().isDeleted()) {
                    SecurityContextHolder.clearContext();
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"error\": \"User account is deactivated or no longer exists. Please contact administrator.\"}");
                    return;
                }

                // Verify that role hasn't changed since token issuance
                UserEntity user = userOptional.get();
                String currentDbRole = user.getRole() != null ? user.getRole().replace("ROLE_", "") : "";
                if (tokenRole != null && !tokenRole.equalsIgnoreCase(currentDbRole)) {
                    SecurityContextHolder.clearContext();
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"error\": \"User role has been updated. Please log in again.\"}");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}

