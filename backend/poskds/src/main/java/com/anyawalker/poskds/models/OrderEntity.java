package com.anyawalker.poskds.models;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_number", nullable = false)
    private Integer orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity userEntity;

    @Column(name = "status", nullable = false, length = 60)
    private String status;

    @Column(name = "order_workload_tier",length = 60,nullable = false)
    private String orderWorkloadTier;

    @Column(name = "payment_status", length = 60)
    private String paymentStatus = "paid";

    @Column(name = "payment_method", length = 60)
    private String paymentMethod = "cash";

    @Column(name = "subtotal_price")
    private Integer subtotalPrice = 0;

    @Column(name = "tax_amount")
    private Integer taxAmount = 0;

    @Column(name = "discount_amount")
    private Integer discountAmount = 0;

    @Column(name = "total_price", nullable = false)
    private int totalPrice;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "orderEntity", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<OrderItemEntity> orderItemEntityList;

    public OrderEntity() {}

    public OrderEntity(Integer orderId, Integer orderNumber, UserEntity userEntity, String status, String orderWorkloadTier, String paymentStatus, String paymentMethod, Integer subtotalPrice, Integer taxAmount, Integer discountAmount, int totalPrice, LocalDateTime createdAt, LocalDateTime updatedAt, boolean isDeleted, List<OrderItemEntity> orderItemEntityList) {
        this.id = orderId;
        this.orderNumber = orderNumber;
        this.userEntity = userEntity;
        this.status = status;
        this.orderWorkloadTier = orderWorkloadTier;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.subtotalPrice = subtotalPrice;
        this.taxAmount = taxAmount;
        this.discountAmount = discountAmount;
        this.totalPrice = totalPrice;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isDeleted = isDeleted;
        this.orderItemEntityList = orderItemEntityList;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer orderId) {
        this.id = orderId;
    }

    public Integer getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(Integer orderNumber) {
        this.orderNumber = orderNumber;
    }

    public UserEntity getUserEntity() {
        return userEntity;
    }

    public void setUserEntity(UserEntity userEntity) {
        this.userEntity = userEntity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOrderWorkloadTier() {
        return orderWorkloadTier;
    }

    public void setOrderWorkloadTier(String orderWorkloadTier) {
        this.orderWorkloadTier = orderWorkloadTier;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Integer getSubtotalPrice() {
        return subtotalPrice;
    }

    public void setSubtotalPrice(Integer subtotalPrice) {
        this.subtotalPrice = subtotalPrice;
    }

    public Integer getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(Integer taxAmount) {
        this.taxAmount = taxAmount;
    }

    public Integer getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Integer discountAmount) {
        this.discountAmount = discountAmount;
    }

    public int getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(int totalPrice) {
        this.totalPrice = totalPrice;
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
