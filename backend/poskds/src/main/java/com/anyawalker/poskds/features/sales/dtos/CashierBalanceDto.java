package com.anyawalker.poskds.features.sales.dtos;

public record CashierBalanceDto(
    Long cashierId,
    String cashierName,
    String mobileNumber,
    int completedOrdersCount,
    long cashRevenue,
    long onlineRevenue,
    long totalRevenue
) {}

