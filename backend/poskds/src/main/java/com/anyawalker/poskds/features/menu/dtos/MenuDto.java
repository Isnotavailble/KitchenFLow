package com.anyawalker.poskds.features.menu.dtos;

import com.anyawalker.poskds.models.entities.MenuEntity;
import java.time.LocalDateTime;

public class MenuDto {

    public record Response(
        Long id,
        String name,
        int currentPrice,
        String cookingDuration,
        String categoryName,
        boolean isAvailable,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        public static Response fromEntity(MenuEntity entity) {
            return new Response(
                entity.getId(),
                entity.getName(),
                entity.getCurrentPrice(),
                entity.getCookingDuration(),
                entity.getCategoryName(),
                entity.isAvailable(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
            );
        }
    }

    public record CreateRequest(
        String name,
        int currentPrice,
        String cookingDuration,
        String categoryName,
        boolean isAvailable
    ) {
        public MenuEntity toEntity() {
            MenuEntity entity = new MenuEntity();
            entity.setName(this.name);
            entity.setCurrentPrice(this.currentPrice);
            entity.setCookingDuration(this.cookingDuration);
            entity.setCategoryName(this.categoryName);
            entity.setAvailable(this.isAvailable);
            return entity;
        }
    }

    public record UpdateRequest(
        String name,
        int currentPrice,
        String cookingDuration,
        String categoryName,
        boolean isAvailable
    ) {
        public void updateEntity(MenuEntity entity) {
            entity.setName(this.name);
            entity.setCurrentPrice(this.currentPrice);
            entity.setCookingDuration(this.cookingDuration);
            entity.setCategoryName(this.categoryName);
            entity.setAvailable(this.isAvailable);
        }
    }
}
