package com.anyawalker.poskds.features.order.dtos;

import java.time.LocalDateTime;

public record MenuResponse(
    Long id,
    String name,
    int currentPrice,
    String cookingDuration,
    String categoryName,
    boolean isAvailable,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
