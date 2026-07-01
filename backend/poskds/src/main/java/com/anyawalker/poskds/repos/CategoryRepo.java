package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.entities.CategoryEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepo extends JpaRepository<@NonNull CategoryEntity,@NonNull Integer> {
    CategoryEntity findByName(String name);
}
