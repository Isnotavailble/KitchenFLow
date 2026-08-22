package com.anyawalker.poskds.features.order.dtos;

import java.util.List;

public record PaginatedOrderResponse(
        List<OrderResponse> items,
        int page,
        int size,
        long totalCount,
        int totalPages,
        boolean hasMore
) {
}
