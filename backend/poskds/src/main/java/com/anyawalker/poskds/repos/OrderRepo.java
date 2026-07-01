package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.OrderEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<@NonNull OrderEntity,@NonNull Integer> {
    //SELECT * FROM orders WHERE user_id = ? AND id = ?
    Optional<OrderEntity> findByIdAndUserEntity_Id(@NonNull Integer orderId,@NonNull Long userId);
    //SELECT * FROM orders BETWEEN ? AND ? ORDER BY order_number DESC LIMIT 1
    Optional<OrderEntity> findTopByCreatedAtBetweenOrderByOrderNumberDesc(@NonNull LocalDateTime startTime, @NonNull LocalDateTime endTime);
}
