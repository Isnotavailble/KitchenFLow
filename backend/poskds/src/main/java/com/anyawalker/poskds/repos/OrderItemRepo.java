package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.OrderItemEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepo extends JpaRepository<@NonNull OrderItemEntity,@NonNull Integer> {

    @Query("""
        SELECT oi.menuEntity.id,
               m.name,
               c.name,
               m.price,
               SUM(oi.quantity),
               SUM(oi.quantity * oi.unitPrice)
        FROM OrderItemEntity oi
        JOIN oi.orderEntity o
        JOIN oi.menuEntity m
        LEFT JOIN m.categoryEntity c
        WHERE o.status = 'completed' AND o.createdAt >= :startTime AND o.createdAt < :endTime
        GROUP BY oi.menuEntity.id, m.name, c.name, m.price
        ORDER BY SUM(oi.quantity) DESC, SUM(oi.quantity * oi.unitPrice) DESC
    """)
    List<Object[]> findMenuPerformance(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}

