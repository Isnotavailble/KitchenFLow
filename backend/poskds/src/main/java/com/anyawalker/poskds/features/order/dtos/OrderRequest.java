package com.anyawalker.poskds.features.order.dtos;

import java.util.List;

public record OrderRequest( String orderType,List<OrderItemRequest> orderItems) {
}
