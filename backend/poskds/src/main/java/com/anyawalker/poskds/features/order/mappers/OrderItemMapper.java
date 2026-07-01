package com.anyawalker.poskds.features.order.mappers;

import com.anyawalker.poskds.features.order.dtos.OrderItemResponse;
import com.anyawalker.poskds.features.order.dtos.OrderResponse;
import com.anyawalker.poskds.models.entities.OrderItemEntity;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class OrderItemMapper {

    public OrderItemResponse toResponseDto(OrderItemEntity orderItemEntity){
        return  new OrderItemResponse(
                orderItemEntity.getId(),
                orderItemEntity.getMenuEntity().getId(),
                orderItemEntity.getMenuEntity().getName(),
                orderItemEntity.getQuantity(),
                orderItemEntity.getUnitPrice(),
                orderItemEntity.getItemNotes());
    }
}
