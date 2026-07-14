package com.anyawalker.poskds.features.order.mappers;

import com.anyawalker.poskds.features.order.dtos.OrderItemResponse;
import com.anyawalker.poskds.features.order.dtos.OrderResponse;
import com.anyawalker.poskds.models.OrderEntity;
import jakarta.annotation.Nullable;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;

    public OrderMapper(OrderItemMapper orderItemMapper) {
        this.orderItemMapper = orderItemMapper;
    }

    public OrderResponse toResponseDTO(OrderEntity orderEntity, String message){

        List<OrderItemResponse> orderItemResponses = orderEntity.getOrderItemEntityList()
                .stream()
                .map(orderItemMapper::toResponseDto)
                .toList();

        return new OrderResponse(
                orderEntity.getId(),
                orderEntity.getUserEntity().getId(),
                orderEntity.getOrderNumber(),
                orderEntity.getStatus(),
                message == null || message.isBlank() ? "" : message,
                orderEntity.getOrderWorkloadTier(),
                orderItemResponses,
                orderEntity.getSubtotalPrice(),
                orderEntity.getTotalPrice(),
                orderEntity.getTaxAmount()
        );
    }
}
