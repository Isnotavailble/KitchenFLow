package com.anyawalker.poskds.features.menu;

import com.anyawalker.poskds.features.menu.dtos.MenuDto;
import com.anyawalker.poskds.features.menu.dtos.PaginatedMenuResponse;
import com.anyawalker.poskds.models.CategoryEntity;
import com.anyawalker.poskds.models.MenuEntity;
import com.anyawalker.poskds.repos.CategoryRepo;
import com.anyawalker.poskds.repos.MenuRepo;
import com.anyawalker.poskds.features.cloudinary.CloudinaryService;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;

@Service
public class MenuService {
    private static final Logger log = LoggerFactory.getLogger(MenuService.class);

    private final MenuRepo menuRepo;
    private final CategoryRepo categoryRepo;
    private final CloudinaryService cloudinaryService;

    public MenuService(MenuRepo menuRepo, CategoryRepo categoryRepo, CloudinaryService cloudinaryService) {
        this.menuRepo = menuRepo;
        this.categoryRepo = categoryRepo;
        this.cloudinaryService = cloudinaryService;
    }

    public PaginatedMenuResponse getMenus(String category, String search, int page, int size) {
        String filterCategory = (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL"))
                ? category.trim().toLowerCase()
                : null;

        String filterSearch = (search != null && !search.isBlank())
                ? search.trim().toLowerCase()
                : null;


        int safePage = Math.max(0, page);
        int safeSize = size <= 0 ? 20 : size;
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<MenuEntity> menuPage = menuRepo.findMenusByFilters(filterCategory, filterSearch, pageable);


        List<MenuDto.Response> items = menuPage.getContent()
                .stream()
                .map(MenuDto.Response::fromEntity)
                .toList();

        return new PaginatedMenuResponse(
                items,
                menuPage.getNumber(),
                menuPage.getSize(),
                menuPage.getTotalElements(),
                menuPage.getTotalPages(),
                menuPage.hasNext()
        );
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
            if (categoryEntity.isDeleted() && request.isAvailable()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot make menu item available because its category is disabled");
            }
        }
        MenuEntity entity = request.toEntity(categoryEntity);
        MenuEntity saved = menuRepo.save(entity);
        return MenuDto.Response.fromEntity(saved);
    }

    public MenuDto.Response updateMenu(Integer id, MenuDto.UpdateRequest request) {
        MenuEntity entity = menuRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu not found with id: " + id));

        CategoryEntity categoryEntity = request.categoryId() != null
                ? categoryRepo.findById(request.categoryId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found with id: " + request.categoryId()))
                : entity.getCategoryEntity();

        if (categoryEntity != null && categoryEntity.isDeleted() && request.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update menu due to unavailable category '" + categoryEntity.getName() + "' is disabled");
        }

        String oldImageId = entity.getImageId();
        request.updateEntity(entity, categoryEntity);
        MenuEntity saved = menuRepo.save(entity);

        if (oldImageId != null && !oldImageId.isEmpty() && !oldImageId.equals(saved.getImageId())) {
            deleteImageQuietly(oldImageId);
        }

        return MenuDto.Response.fromEntity(saved);
    }


    public MenuDto.Response toggleMenuItem(Integer id, Boolean toggle) {
        if (id == null || toggle == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "menu Id and toggle value is required");

        MenuEntity menuEntity = menuRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu not found with id: " + id));

        if (toggle && menuEntity.getCategoryEntity() != null && menuEntity.getCategoryEntity().isDeleted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot toggle menu due to unavailable category '" + menuEntity.getCategoryEntity().getName() + "'");
        }

        menuEntity.setAvailable(toggle);
        return MenuDto.Response.fromEntity(menuRepo.save(menuEntity));
    }


    public void deleteMenu(Integer id) {
        MenuEntity entity = menuRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu not found with id: " + id));
        
        String imageId = entity.getImageId();
        menuRepo.delete(entity);

        if (imageId != null && !imageId.isEmpty()) {
            deleteImageQuietly(imageId);
        }
    }

    private void deleteImageQuietly(String publicId) {
        try {
            cloudinaryService.deleteImage(publicId);
        } catch (IOException e) {
            log.warn("Failed to delete Cloudinary image {}", publicId, e);
        }
    }

}
