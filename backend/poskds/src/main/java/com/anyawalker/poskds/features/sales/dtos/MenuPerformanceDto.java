package com.anyawalker.poskds.features.sales.dtos;

public record MenuPerformanceDto(
    Integer menuId,
    String name,
    String categoryName,
    int unitPrice,
    long quantitySold,
    long totalRevenue
) {}

