package com.anyawalker.poskds.features.auth.dtos;

public record LoginResponse(Long userId,String username,String email,String role,TokenResponse token) {
}
