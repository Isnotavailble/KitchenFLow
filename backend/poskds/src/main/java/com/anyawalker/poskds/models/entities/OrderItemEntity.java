package com.anyawalker.poskds.models.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private OrderEntity orderEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id")
    private MenuEntity menuEntity;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name ="unit_price", nullable = false)
    private int unitPrice;

    @Column(name = "item_notes", length = 255)
    private String itemNotes;

    public OrderItemEntity() {}

    public OrderItemEntity(Integer orderItemId, OrderEntity orderEntity, MenuEntity menuEntity, int quantity, int unitPrice, String itemNotes) {
        this.id = orderItemId;
        this.orderEntity = orderEntity;
        this.menuEntity = menuEntity;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.itemNotes = itemNotes;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer orderItemId) {
        this.id = orderItemId;
    }

    public OrderEntity getOrderEntity() {
        return orderEntity;
    }

    public void setOrderEntity(OrderEntity orderEntity) {
        this.orderEntity = orderEntity;
    }

    public MenuEntity getMenuEntity() {
        return menuEntity;
    }

    public void setMenuEntity(MenuEntity menuEntity) {
        this.menuEntity = menuEntity;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(int unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getItemNotes() {
        return itemNotes;
    }

    public void setItemNotes(String itemNotes) {
        this.itemNotes = itemNotes;
    }
}
