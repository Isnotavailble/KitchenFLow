package com.anyawalker.poskds.features.menu;

import com.anyawalker.poskds.features.menu.dtos.MenuDto;
import com.anyawalker.poskds.models.CategoryEntity;
import com.anyawalker.poskds.models.MenuEntity;
import com.anyawalker.poskds.repos.CategoryRepo;
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
    private final CategoryRepo categoryRepo;

    public MenuService(MenuRepo menuRepo, CategoryRepo categoryRepo) {
        this.menuRepo = menuRepo;
        this.categoryRepo = categoryRepo;
    }

    public List<MenuDto.Response> getAllMenu() {
        return menuRepo.findAll()
                .stream()
                .map(MenuDto.Response::fromEntity)
                .toList();
    }

    public MenuDto.Response getMenuById(Integer id) {
        MenuEntity entity = menuRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu not found with id: " + id));
        return MenuDto.Response.fromEntity(entity);
    }

    public MenuDto.Response createMenu(MenuDto.CreateRequest request) {
        CategoryEntity categoryEntity = null;
        if (request.categoryId() != null) {
            categoryEntity = categoryRepo.findById(request.categoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found with id: " + request.categoryId()));
        }
        MenuEntity entity = request.toEntity(categoryEntity);
        MenuEntity saved = menuRepo.save(entity);
        return MenuDto.Response.fromEntity(saved);
    }

    public MenuDto.Response updateMenu(Integer id, MenuDto.UpdateRequest request) {
        MenuEntity entity = menuRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu not found with id: " + id));
        
        CategoryEntity categoryEntity = null;
        if (request.categoryId() != null) {
            categoryEntity = categoryRepo.findById(request.categoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found with id: " + request.categoryId()));
        }
        
        request.updateEntity(entity, categoryEntity);
        MenuEntity saved = menuRepo.save(entity);
        return MenuDto.Response.fromEntity(saved);
    }

    public void deleteMenu(Integer id) {
        MenuEntity entity = menuRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu not found with id: " + id));
        menuRepo.delete(entity);
    }

    public List<MenuEntity> getMenuEntityListByIds(List<Integer> menuIdList){
        return menuRepo.findAllById(menuIdList);
    }
    public Map<Integer,MenuEntity> getMenuEntityMapByIds(List<Integer> menuIdList){
        //get all menu by list of ids
        List<MenuEntity> menuEntityList = getMenuEntityListByIds(menuIdList);

        //create Map for lookup ( faster than list )
        return menuEntityList.stream()
                .collect(Collectors.toMap(MenuEntity::getId, menuEntity -> menuEntity));
    }
}
