package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.features.category.dtos.CategoryResponse;
import com.anyawalker.poskds.models.CategoryEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepo extends JpaRepository<@NonNull CategoryEntity, @NonNull Integer> {
    CategoryEntity findByName(String name);
    Optional<CategoryEntity> findByNameIgnoreCase(String name);
    List<CategoryEntity> findByIsDeletedFalseOrderByIdAsc();
    List<CategoryEntity> findAllByOrderByIdAsc();
    boolean existsByNameIgnoreCaseAndIdNot(String name, Integer id);

    @Query("""
        SELECT new com.anyawalker.poskds.features.category.dtos.CategoryResponse(
            c.id,
            c.name,
            c.isDeleted,
            COUNT(m.id)
        )
        FROM CategoryEntity c
        LEFT JOIN c.menuEntities m
        WHERE c.isDeleted = false
        GROUP BY c.id, c.name, c.isDeleted
        ORDER BY c.id ASC
    """)
    List<CategoryResponse> findActiveCategoryResponses();

    @Query("""
        SELECT new com.anyawalker.poskds.features.category.dtos.CategoryResponse(
            c.id,
            c.name,
            c.isDeleted,
            COUNT(m.id)
        )
        FROM CategoryEntity c
        LEFT JOIN c.menuEntities m
        GROUP BY c.id, c.name, c.isDeleted
        ORDER BY c.id ASC
    """)
    List<CategoryResponse> findAllCategoryResponses();
}


