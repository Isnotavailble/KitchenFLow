package com.anyawalker.poskds.features.order.dtos;

import java.util.List;

public record OrderRequest(Long userId, List<OrderItemRequest> orderItems) {
}
