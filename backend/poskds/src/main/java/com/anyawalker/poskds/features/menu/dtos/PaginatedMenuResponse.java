package com.anyawalker.poskds.features.menu.dtos;

import java.util.List;

public record PaginatedMenuResponse(
        List<MenuDto.Response> items,
        int page,
        int size,
        long totalCount,
        int totalPages,
        boolean hasMore
) {
}
