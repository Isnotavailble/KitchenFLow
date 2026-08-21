package com.anyawalker.poskds.repos;

import com.anyawalker.poskds.models.MenuEntity;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepo extends JpaRepository<@NonNull MenuEntity,@NonNull Integer> {
    List<MenuEntity> findAllByIdInAndIsAvailableTrue(List<Integer> menuIdList);
    List<MenuEntity> findAllByIdInAndIsAvailableFalse(List<Integer> menuIdList);
}
