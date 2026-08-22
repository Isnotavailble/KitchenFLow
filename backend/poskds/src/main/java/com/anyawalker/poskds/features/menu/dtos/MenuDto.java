package com.anyawalker.poskds.features.menu.dtos;

import com.anyawalker.poskds.models.CategoryEntity;
import com.anyawalker.poskds.models.MenuEntity;
import java.time.LocalDateTime;

public class MenuDto {

    public record Response(
        Integer id,
        String name,
        int price,
        String imageUrl,
        String imageId,
        Integer categoryId,
        String categoryName,
        boolean isCategoryDeleted,
        boolean isAvailable,
        int workloadTier,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        public static Response fromEntity(MenuEntity entity) {
            return new Response(
                entity.getId(),
                entity.getName(),
                entity.getPrice(),
                entity.getImageUrl(),
                entity.getImageId(),
                entity.getCategoryEntity() != null ? entity.getCategoryEntity().getId() : null,
                entity.getCategoryEntity() != null ? entity.getCategoryEntity().getName() : null,
                entity.getCategoryEntity() != null && entity.getCategoryEntity().isDeleted(),
                entity.isAvailable(),
                entity.getWorkloadTier(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
            );
        }
    }


    public record CreateRequest(
        String name,
        int price,
        String imageUrl,
        String imageId,
        Integer categoryId,
        boolean isAvailable,
        int workloadTier
    ) {
        public MenuEntity toEntity(CategoryEntity categoryEntity) {
            MenuEntity entity = new MenuEntity();
            entity.setName(this.name);
            entity.setPrice(this.price);
            entity.setImageUrl(this.imageUrl);
            entity.setImageId(this.imageId);
            entity.setCategoryEntity(categoryEntity);
            entity.setAvailable(this.isAvailable);
            entity.setWorkloadTier(this.workloadTier);
            return entity;
        }
    }

    public record UpdateRequest(
        String name,
        int price,
        String imageUrl,
        String imageId,
        Integer categoryId,
        boolean isAvailable,
        int workloadTier
    ) {
        public void updateEntity(MenuEntity entity, CategoryEntity categoryEntity) {
            entity.setName(this.name);
            entity.setPrice(this.price);
            entity.setImageUrl(this.imageUrl);
            entity.setImageId(this.imageId);
            entity.setCategoryEntity(categoryEntity);
            entity.setAvailable(this.isAvailable);
            entity.setWorkloadTier(this.workloadTier);
        }
    }
}
