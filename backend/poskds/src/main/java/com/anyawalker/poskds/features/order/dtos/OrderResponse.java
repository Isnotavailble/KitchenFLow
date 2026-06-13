package com.anyawalker.poskds.features.order.dtos;

import java.util.List;

public record OrderResponse (Long id, Long userId, String status, String message, List<OrderItemResponse> orderItems){
}
