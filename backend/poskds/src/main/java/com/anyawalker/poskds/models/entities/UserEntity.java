package com.anyawalker.poskds.models.entities;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name",length = 120)
    private String username;
    
    @Column(name = "mobile_number",length = 100, unique = true)
    private String mobileNumber;
    
    @Column(name = "password")
    private String password;

    @Column(name = "role", length = 60)
    private String role;

    @Column(name = "is_deleted",nullable = false)
    private boolean isDeleted;

    @CreatedDate
    @Column(name = "createdAt")
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updatedAt")
    private Instant updatedAt;


    @OneToMany(mappedBy = "userEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TokenEntity> tokenEntities;
    @OneToMany(mappedBy = "userEntity",fetch = FetchType.LAZY)
    private List<OrderEntity> orderEntityList;

    public UserEntity() {}

    public UserEntity(Long id,
                      String name,
                      String mobileNumber,
                      String password,
                      String role,
                      List<TokenEntity> tokenEntities,
                      List<OrderEntity> orderEntityList,
                      boolean isDeleted,
                      Instant createdAt,
                      Instant updatedAt) {
        this.id = id;
        this.mobileNumber = mobileNumber;
        this.username = name;
        this.password = password;
        this.role = role;
        this.tokenEntities = tokenEntities;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.orderEntityList = orderEntityList;
    }

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<OrderEntity> getOrderEntityList(){
        return this.orderEntityList;
    }
    public void setOrderEntityList(List<OrderEntity> orderEntityList){
        this.orderEntityList = orderEntityList;
    }

    public String getUsername() {
        return this.username;
    }

    public void setUsername(String name) {
        this.username = name;
    }

    public String getMobileNumber() {
        return this.mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<TokenEntity> getTokenEntities() {
        return tokenEntities;
    }

    public void setTokenEntities(List<TokenEntity> tokenEntities) {
        this.tokenEntities = tokenEntities;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
