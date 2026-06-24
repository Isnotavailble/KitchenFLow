package com.anyawalker.poskds.models.entities;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens", indexes = {
        @Index(name = "idx_refresh_token", columnList = "refresh_token")
})
@EntityListeners(AuditingEntityListener.class)
public class TokenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "refresh_token",length = 500,unique = true)
    private String refreshToken;

    @Column(name = "is_revoked",nullable = false)
    private boolean isRevoked = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity userEntity;
    //for refresh token
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    //for refresh token
    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TokenEntity() {}

    public TokenEntity(Integer id,
                       UserEntity userEntity,
                       LocalDateTime expiresAt,
                       LocalDateTime createdAt,
                       LocalDateTime updatedAt,boolean isRevoked) {
        this.userEntity = userEntity;
        this.expiresAt = expiresAt;
        this.id = id;
        this.isRevoked = isRevoked;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    public LocalDateTime getUpdatedAt(){
        return this.updatedAt;
    }
    public void setUpdatedAt(LocalDateTime dateTime){
        this.updatedAt = dateTime;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public UserEntity getUser() {
        return userEntity;
    }

    public void setUser(UserEntity userEntity) {
        this.userEntity = userEntity;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getId() {return id;}

    public void setId(Integer id) {this.id = id;}

    public boolean isRevoked() {return isRevoked;}

    public void setRevoked(boolean revoked) {isRevoked = revoked;}
}
