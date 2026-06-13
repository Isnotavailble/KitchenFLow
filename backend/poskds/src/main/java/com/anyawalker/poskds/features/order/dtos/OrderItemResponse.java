package com.anyawalker.poskds.features.order.dtos;

public record OrderItemResponse(Long id,Long menuId,int quantity,int unitPrice,int totalPrice) {
}
