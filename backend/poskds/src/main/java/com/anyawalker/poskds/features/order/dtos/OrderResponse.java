package com.anyawalker.poskds.features.order.dtos;

import java.util.List;

public record OrderResponse(Integer id,
                            Long userId,
                            int orderNumber,
                            String status,
                            String message,
                            String workloadTier,
                            List<OrderItemResponse> orderItems,
                            int totalPriceBeforeTax,
                            int totalPriceAfterTax,
                            int taxAmount) {
}
