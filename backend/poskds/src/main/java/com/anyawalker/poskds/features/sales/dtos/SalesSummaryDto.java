package com.anyawalker.poskds.features.sales.dtos;

public record SalesSummaryDto(
    long todayTotalRevenue,
    long todayGrossRevenue,
    long todayNetRevenue,
    long todayTaxAmount,
    long todayDiscountAmount,
    int todayCompletedOrdersCount,
    int activeWaitingTicketsCount,
    BestSellingItemDto todayBestSellingItem,
    PaymentSplitDto paymentSplit,
    PeakOperationTimeDto peakOperationTime
) {
    public record BestSellingItemDto(
        Integer menuId,
        String name,
        long quantitySold,
        long totalRevenue
    ) {}

    public record PaymentSplitDto(
        long cashRevenue,
        long onlineRevenue,
        int cashOrderCount,
        int onlineOrderCount
    ) {}

    public record PeakOperationTimeDto(
        String peakTime,
        int peakOrderCount,
        String lowestTime,
        int lowestOrderCount
    ) {}
}


