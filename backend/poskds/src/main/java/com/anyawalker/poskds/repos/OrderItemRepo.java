package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.entities.OrderItemEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepo extends JpaRepository<@NonNull OrderItemEntity,@NonNull Long> {
}
