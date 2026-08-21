package com.anyawalker.poskds.features.order.mappers;

import com.anyawalker.poskds.features.order.dtos.OrderItemResponse;
import com.anyawalker.poskds.features.order.dtos.OrderResponse;
import com.anyawalker.poskds.models.OrderEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;

    public OrderMapper(OrderItemMapper orderItemMapper) {
        this.orderItemMapper = orderItemMapper;
    }

    public OrderResponse toResponseDTO(OrderEntity orderEntity, String message){

        List<OrderItemResponse> orderItemResponses = orderEntity.getOrderItemEntityList() != null
                ? orderEntity.getOrderItemEntityList().stream().map(orderItemMapper::toResponseDto).toList()
                : List.of();

        return new OrderResponse(
                orderEntity.getId(),
                orderEntity.getUserEntity() != null ? orderEntity.getUserEntity().getId() : null,
                orderEntity.getOrderNumber() != null ? orderEntity.getOrderNumber() : 0,
                orderEntity.getStatus(),
                message == null || message.isBlank() ? "" : message,
                orderEntity.getOrderWorkloadTier(),
                orderItemResponses,
                orderEntity.getSubtotalPrice() != null ? orderEntity.getSubtotalPrice() : 0,
                orderEntity.getTotalPrice(),
                orderEntity.getTaxAmount() != null ? orderEntity.getTaxAmount() : 0,
                orderEntity.getCreatedAt(),
                orderEntity.getUpdatedAt()
        );
    }
}
