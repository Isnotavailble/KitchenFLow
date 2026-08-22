package com.anyawalker.poskds.features.category.dtos;

public record CategoryResponse(
    Integer id,
    String name,
    boolean isDeleted,
    long itemCount
) {
    public CategoryResponse(Integer id, String name) {
        this(id, name, false, 0);
    }
}

