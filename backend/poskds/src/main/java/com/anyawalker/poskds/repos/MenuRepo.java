package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.MenuEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepo extends JpaRepository<@NonNull MenuEntity,@NonNull Integer> {
}
