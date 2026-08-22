package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.MenuEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.anyawalker.poskds.models.CategoryEntity;
import org.springframework.data.jpa.repository.Modifying;

@Repository
public interface MenuRepo extends JpaRepository<@NonNull MenuEntity,@NonNull Integer> {
    List<MenuEntity> findAllByIdInAndIsAvailableTrue(List<Integer> menuIdList);
    List<MenuEntity> findAllByIdInAndIsAvailableFalse(List<Integer> menuIdList);
    long countByCategoryEntity_Id(Integer categoryId);
    List<MenuEntity> findByCategoryEntity_Id(Integer categoryId);

    @Modifying
    @Query("UPDATE MenuEntity m SET m.isAvailable = false WHERE m.categoryEntity.id = :categoryId")
    int disableAllMenusByCategoryId(@Param("categoryId") Integer categoryId);

    @Modifying
    @Query("UPDATE MenuEntity m SET m.categoryEntity = :targetCategory WHERE m.categoryEntity.id = :categoryId")
    int reassignCategoryForMenus(@Param("categoryId") Integer categoryId, @Param("targetCategory") CategoryEntity targetCategory);

    @Modifying
    @Query("DELETE FROM MenuEntity m WHERE m.categoryEntity.id = :categoryId")
    int deleteMenusByCategoryId(@Param("categoryId") Integer categoryId);



    @Query(
        value = """
            SELECT m FROM MenuEntity m
            LEFT JOIN m.categoryEntity c
            WHERE (CAST(:category AS string) IS NULL OR LOWER(c.name) = LOWER(CAST(:category AS string)))
              AND (CAST(:search AS string) IS NULL OR LOWER(m.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%'))
            ORDER BY m.id ASC
        """,
        countQuery = """
            SELECT COUNT(m) FROM MenuEntity m
            LEFT JOIN m.categoryEntity c
            WHERE (CAST(:category AS string) IS NULL OR LOWER(c.name) = LOWER(CAST(:category AS string)))
              AND (CAST(:search AS string) IS NULL OR LOWER(m.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%'))
        """
    )
    Page<MenuEntity> findMenusByFilters(
        @Param("category") String category,
        @Param("search") String search,
        Pageable pageable
    );

    @Query(
        value = "SELECT m.name FROM menus m WHERE m.id IN (:ids)",
        nativeQuery = true
    )
    List<String> findMenuNamesByIds(@Param("ids") List<Integer> ids);
}





