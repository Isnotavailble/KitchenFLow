package com.anyawalker.poskds.models;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "menus")
@EntityListeners(AuditingEntityListener.class)
public class MenuEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "price", nullable = false)
    private int price;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "image_id", columnDefinition = "TEXT")
    private String imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryEntity categoryEntity;

    @Column(name = "is_available")
    private boolean isAvailable = true;

    @Column(name = "workload_tier")
    private Integer workloadTier = 1;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    @OneToMany(mappedBy = "menuEntity", fetch = FetchType.LAZY)
    private List<OrderItemEntity> orderItemEntityList;

    public MenuEntity() {}

    public MenuEntity(Integer id, String name,
                      int price,
                      String imageUrl,
                      String imageId,
                      CategoryEntity categoryEntity,
                      boolean isAvailable,
                      Integer workloadTier,
                      LocalDateTime createdAt,
                      LocalDateTime updatedAt,
                      boolean isDeleted,
                      List<OrderItemEntity> orderItemEntityList) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
        this.imageId = imageId;
        this.categoryEntity = categoryEntity;
        this.isAvailable = isAvailable;
        this.workloadTier = workloadTier;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isDeleted = isDeleted;
        this.orderItemEntityList = orderItemEntityList;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer menuId) {
        this.id = menuId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageId() {
        return imageId;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }

    public CategoryEntity getCategoryEntity() {
        return categoryEntity;
    }

    public void setCategoryEntity(CategoryEntity categoryEntity) {
        this.categoryEntity = categoryEntity;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public int getWorkloadTier() {
        return workloadTier;
    }

    public void setWorkloadTier(Integer workloadTier) {
        this.workloadTier = workloadTier;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public List<OrderItemEntity> getOrderItemEntityList() {
        return orderItemEntityList;
    }

    public void setOrderItemEntityList(List<OrderItemEntity> orderItemEntityList) {
        this.orderItemEntityList = orderItemEntityList;
    }
}
