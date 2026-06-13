package com.anyawalker.poskds.models.entities;

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
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "current_price", nullable = false)
    private int currentPrice;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable;

    //fast,medium,heavy
    @Column(name = "cooking_duration", length = 60)
    private String cookingDuration;

    @CreatedDate
    @Column(name ="created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "menuEntity", fetch = FetchType.LAZY)
    private List<OrderItemEntity> orderItemEntityList;

    // Default Constructor
    public MenuEntity() {}

    // Parameterized Constructor
    public MenuEntity(String name,
                      int currentPrice,
                      String categoryName,
                      boolean isAvailable,
                      LocalDateTime createdAt,
                      LocalDateTime updatedAt,
                      List<OrderItemEntity> orderItemEntityList,
                      String cookingDuration
    ) {
        this.name = name;
        this.currentPrice = currentPrice;
        this.categoryName = categoryName;
        this.isAvailable = isAvailable;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.orderItemEntityList = orderItemEntityList;
        this.cookingDuration = cookingDuration;
    }

    // Getters and Setters
    public String getCookingDuration(){
        return this.cookingDuration;
    }
    public void setCookingDuration(String type){
        this.cookingDuration = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(int currentPrice) {
        this.currentPrice = currentPrice;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
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

    public List<OrderItemEntity> getOrderItemEntityList() {
        return orderItemEntityList;
    }

    public void setOrderItemEntityList(List<OrderItemEntity> orderItemEntityList) {
        this.orderItemEntityList = orderItemEntityList;
    }
}
