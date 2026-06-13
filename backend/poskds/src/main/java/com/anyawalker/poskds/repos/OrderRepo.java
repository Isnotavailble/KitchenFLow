package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.entities.OrderEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepo extends JpaRepository<@NonNull OrderEntity,@NonNull Long> {

}
