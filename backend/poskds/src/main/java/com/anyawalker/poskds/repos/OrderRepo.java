package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.OrderEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<@NonNull OrderEntity, @NonNull Integer> {
    //SELECT * FROM orders WHERE user_id = ? AND id = ?
    Optional<OrderEntity> findByIdAndUserEntity_Id(@NonNull Integer orderId, @NonNull Long userId);

    //SELECT * FROM orders BETWEEN ? AND ? ORDER BY order_number DESC LIMIT 1
    Optional<OrderEntity> findTopByCreatedAtBetweenOrderByOrderNumberDesc(@NonNull LocalDateTime startTime, @NonNull LocalDateTime endTime);
    @Query("""
        SELECT o FROM OrderEntity o
        LEFT JOIN FETCH o.orderItemEntityList oi
        LEFT JOIN FETCH oi.menuEntity m
        LEFT JOIN FETCH m.categoryEntity c
        WHERE o.id = :id
    """)
    Optional<OrderEntity> findByIdWithJoin(@Param("id") Integer id);

    @Query(
        value = """
            SELECT DISTINCT o FROM OrderEntity o
            LEFT JOIN o.orderItemEntityList oi
            LEFT JOIN oi.menuEntity m
            LEFT JOIN m.categoryEntity c
            WHERE o.createdAt >= :startTime AND o.createdAt < :endTime
              AND (CAST(:status AS string) IS NULL OR o.status = :status)
              AND (CAST(:priorityCutoff AS timestamp) IS NULL OR o.createdAt <= :priorityCutoff)
              AND (CAST(:orderNumber AS integer) IS NULL OR o.orderNumber = :orderNumber)
              AND (CAST(:category AS string) IS NULL OR LOWER(c.name) = :category OR LOWER(m.name) = :category)
        """,
        countQuery = """
            SELECT COUNT(DISTINCT o) FROM OrderEntity o
            LEFT JOIN o.orderItemEntityList oi
            LEFT JOIN oi.menuEntity m
            LEFT JOIN m.categoryEntity c
            WHERE o.createdAt >= :startTime AND o.createdAt < :endTime
              AND (CAST(:status AS string) IS NULL OR o.status = :status)
              AND (CAST(:priorityCutoff AS timestamp) IS NULL OR o.createdAt <= :priorityCutoff)
              AND (CAST(:orderNumber AS integer) IS NULL OR o.orderNumber = :orderNumber)
              AND (CAST(:category AS string) IS NULL OR LOWER(c.name) = :category OR LOWER(m.name) = :category)
        """
    )

    Page<OrderEntity> findOrdersByFilters(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("status") String status,
        @Param("priorityCutoff") LocalDateTime priorityCutoff,
        @Param("orderNumber") Integer orderNumber,
        @Param("category") String category,
        Pageable pageable
    );

    @Query(
        value = "SELECT * FROM orders o WHERE o.created_at >= :startTime AND o.created_at < :endTime AND o.status = 'completed' ORDER BY o.updated_at DESC, o.created_at DESC LIMIT 50",
        nativeQuery = true
    )
    List<OrderEntity> findTodayCompletedOrders(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}




