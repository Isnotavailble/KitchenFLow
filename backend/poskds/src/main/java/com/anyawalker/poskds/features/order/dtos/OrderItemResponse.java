package com.anyawalker.poskds.features.order.dtos;

public record OrderItemResponse(Integer id,
                                Integer menuId,
                                String menuName,
                                String categoryName,
                                String imageUrl,
                                int quantity,
                                int unitPrice,
                                String itemNote) {
}
