package com.anyawalker.poskds.features.auth.dtos;

public record LoginResponse(String username,String email,String role,TokenResponse token) {
}
