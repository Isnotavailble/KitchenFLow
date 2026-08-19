package com.anyawalker.poskds.features.preorder.dtos;

import java.util.List;

public final class PreOrderDto {

    private PreOrderDto() {}

    public record ItemRequest(
            Integer menuId,
            int quantity,
            String itemNote
    ) {}

    public record CreateRequest(
            List<ItemRequest> items
    ) {}

    public record CreateResponse(
            String code,
            String qrImageBase64,
            long expiresInSeconds
    ) {}

    public record ItemDetail(
            Integer menuId,
            String menuName,
            int price,
            String imageUrl,
            int quantity,
            String itemNote,
            int subtotal,
            boolean isAvailable
    ) {}

    public record DetailsResponse(
            String code,
            List<ItemDetail> items,
            int subtotalPrice,
            int taxAmount,
            int totalPrice,
            boolean allItemsAvailable
    ) {}

    public record RedisDraft(
            List<ItemRequest> items,
            long createdAt
    ) {}
}
