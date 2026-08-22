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

@Repository
public interface MenuRepo extends JpaRepository<@NonNull MenuEntity,@NonNull Integer> {
    List<MenuEntity> findAllByIdInAndIsAvailableTrue(List<Integer> menuIdList);
    List<MenuEntity> findAllByIdInAndIsAvailableFalse(List<Integer> menuIdList);

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





