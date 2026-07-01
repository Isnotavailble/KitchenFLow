package com.anyawalker.poskds.features.order.dtos;

public record OrderItemResponse(Integer id,Integer menuId,String menuName,int quantity,int unitPrice,String itemNote) {
}
