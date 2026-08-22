package com.anyawalker.poskds.features.sales.dtos;

public record SalesTrendPointDto(
    String label,
    String key,
    long revenue,
    int orderCount
) {}

