package com.anyawalker.poskds.features.order.mappers;

import com.anyawalker.poskds.features.order.dtos.OrderItemResponse;
import com.anyawalker.poskds.models.OrderItemEntity;
import org.springframework.stereotype.Component;

@Component
public class OrderItemMapper {

    public OrderItemResponse toResponseDto(OrderItemEntity orderItemEntity){
        String imageUrl = orderItemEntity.getMenuEntity() != null ? orderItemEntity.getMenuEntity().getImageUrl() : null;
        String categoryName = orderItemEntity.getMenuEntity() != null && orderItemEntity.getMenuEntity().getCategoryEntity() != null
                ? orderItemEntity.getMenuEntity().getCategoryEntity().getName()
                : "General";

        return new OrderItemResponse(
                orderItemEntity.getId(),
                orderItemEntity.getMenuEntity() != null ? orderItemEntity.getMenuEntity().getId() : null,
                orderItemEntity.getMenuEntity() != null ? orderItemEntity.getMenuEntity().getName() : "Item",
                categoryName,
                imageUrl,
                orderItemEntity.getQuantity(),
                orderItemEntity.getUnitPrice(),
                orderItemEntity.getItemNotes());
    }
}
