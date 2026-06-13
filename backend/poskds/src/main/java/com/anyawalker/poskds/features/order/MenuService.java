package com.anyawalker.poskds.features.order;

import com.anyawalker.poskds.features.order.dtos.MenuResponse;
import com.anyawalker.poskds.models.entities.MenuEntity;
import com.anyawalker.poskds.repos.MenuRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuService {
    private final MenuRepo menuRepo;

    public MenuService(MenuRepo menuRepo) {
        this.menuRepo = menuRepo;
    }

    public List<MenuResponse> getAllMenu() {
        return menuRepo.findAll()
                .stream()
                .map(menuEntity ->
                        new MenuResponse(menuEntity.getId(),
                                menuEntity.getName(),
                                menuEntity.getCurrentPrice(),
                                menuEntity.getCategoryName(),
                                menuEntity.getCookingDuration(),
                                menuEntity.isAvailable(),
                                menuEntity.getCreatedAt(),
                                menuEntity.getUpdatedAt())
                )
                .toList();
    }
}
