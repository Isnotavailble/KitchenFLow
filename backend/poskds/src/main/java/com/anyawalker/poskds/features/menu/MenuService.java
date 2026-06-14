package com.anyawalker.poskds.features.menu;

import com.anyawalker.poskds.features.menu.dtos.MenuResponse;
import com.anyawalker.poskds.models.entities.MenuEntity;
import com.anyawalker.poskds.repos.MenuRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public List<MenuEntity> getMenuEntityListByIds(List<Long> menuIdList){
        return menuRepo.findAllById(menuIdList);
    }
    public Map<Long,MenuEntity> getMenuEntityMapByIds(List<Long> menuIdList){
        //get all menu by list of ids
        List<MenuEntity> menuEntityList = getMenuEntityListByIds(menuIdList);

        //create Map for lookup ( faster than list )
        return menuEntityList.stream()
                .collect(Collectors.toMap(MenuEntity::getId, menuEntity -> menuEntity));
    }

}
