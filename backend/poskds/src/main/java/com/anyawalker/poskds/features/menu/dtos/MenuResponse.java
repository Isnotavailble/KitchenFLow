package com.anyawalker.poskds.features.menu.dtos;

import java.time.LocalDateTime;

public record MenuResponse(
    Integer id,
    String name,
    int currentPrice,
    int workloadTier,
    String categoryName,
    boolean isAvailable,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
