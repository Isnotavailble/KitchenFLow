package com.anyawalker.poskds.features.preorder.utils;

import com.anyawalker.poskds.features.preorder.dtos.PreOrderDto.CreateRequest;
import com.anyawalker.poskds.features.preorder.dtos.PreOrderDto.ItemRequest;

public class PreOrderValidator {

    private PreOrderValidator() {}

    public static String validateCreatePayload(CreateRequest request) {
        if (request == null) {
            return "Request body cannot be null";
        }
        if (request.items() == null || request.items().isEmpty()) {
            return "Order items cannot be empty";
        }
        for (ItemRequest item : request.items()) {
            if (item == null) {
                return "Order item cannot be null";
            }
            if (item.menuId() == null || item.menuId() <= 0) {
                return "Valid menuId is required for all items";
            }
            if (item.quantity() <= 0) {
                return "Quantity must be at least 1 for menu item id: " + item.menuId();
            }
            if (item.quantity() > 99) {
                return "Quantity cannot exceed 99 for menu item id: " + item.menuId();
            }
        }
        return null;
    }

    public static String validateCode(String code) {
        if (code == null || code.isBlank()) {
            return "Pre-order code cannot be blank";
        }
        String trimmed = code.trim();
        if (trimmed.length() < 4 || trimmed.length() > 20) {
            return "Invalid pre-order code format";
        }
        return null;
    }
}
