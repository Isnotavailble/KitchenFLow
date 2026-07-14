package com.anyawalker.poskds.features.menu;

import com.anyawalker.poskds.features.menu.dtos.MenuDto;
import com.anyawalker.poskds.models.entities.MenuEntity;
import com.anyawalker.poskds.repos.MenuRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MenuService {
    private final MenuRepo menuRepo;

    public MenuService(MenuRepo menuRepo) {
        this.menuRepo = menuRepo;
    }

    public List<MenuDto.Response> getAllMenu() {
        return menuRepo.findAll()
                .stream()
                .map(MenuDto.Response::fromEntity)
                .toList();
    }

    public MenuDto.Response getMenuById(Long id) {
        MenuEntity entity = menuRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu not found with id: " + id));
        return MenuDto.Response.fromEntity(entity);
    }

    public MenuDto.Response createMenu(MenuDto.CreateRequest request) {
        MenuEntity entity = request.toEntity();
        MenuEntity saved = menuRepo.save(entity);
        return MenuDto.Response.fromEntity(saved);
    }

    public MenuDto.Response updateMenu(Long id, MenuDto.UpdateRequest request) {
        MenuEntity entity = menuRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu not found with id: " + id));
        request.updateEntity(entity);
        MenuEntity saved = menuRepo.save(entity);
        return MenuDto.Response.fromEntity(saved);
    }

    public void deleteMenu(Long id) {
        MenuEntity entity = menuRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu not found with id: " + id));
        menuRepo.delete(entity);
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
