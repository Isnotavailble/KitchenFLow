package com.anyawalker.poskds.features.menu;

import com.anyawalker.poskds.features.menu.dtos.MenuDto;
import com.anyawalker.poskds.models.CategoryEntity;
import com.anyawalker.poskds.models.MenuEntity;
import com.anyawalker.poskds.repos.CategoryRepo;
import com.anyawalker.poskds.repos.MenuRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MenuServiceTest {

    @Mock
    private MenuRepo menuRepo;

    @Mock
    private CategoryRepo categoryRepo;

    @InjectMocks
    private MenuService menuService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllMenu_ShouldReturnResponseList() {
        CategoryEntity category = new CategoryEntity(1, "Food", null);
        MenuEntity menuEntity = new MenuEntity();
        menuEntity.setId(1);
        menuEntity.setName("Pizza");
        menuEntity.setPrice(10);
        menuEntity.setWorkloadTier(1);
        menuEntity.setCategoryEntity(category);
        menuEntity.setAvailable(true);

        when(menuRepo.findAll()).thenReturn(List.of(menuEntity));

        List<MenuDto.Response> result = menuService.getAllMenu();

        assertEquals(1, result.size());
        assertEquals("Pizza", result.get(0).name());
        assertEquals("Food", result.get(0).categoryName());
        verify(menuRepo, times(1)).findAll();
    }

    @Test
    void getMenuById_WhenFound_ShouldReturnResponse() {
        MenuEntity menuEntity = new MenuEntity();
        menuEntity.setId(1);
        menuEntity.setName("Pizza");

        when(menuRepo.findById(1)).thenReturn(Optional.of(menuEntity));

        MenuDto.Response result = menuService.getMenuById(1);

        assertNotNull(result);
        assertEquals("Pizza", result.name());
    }

    @Test
    void getMenuById_WhenNotFound_ShouldThrowException() {
        when(menuRepo.findById(1)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> menuService.getMenuById(1));
    }

    @Test
    void createMenu_ShouldSaveAndReturnResponse() {
        MenuDto.CreateRequest request = new MenuDto.CreateRequest("Pizza", 10, "url", "id", 1, true, 1);
        CategoryEntity category = new CategoryEntity(1, "Food", null);
        MenuEntity savedEntity = new MenuEntity();
        savedEntity.setId(1);
        savedEntity.setName("Pizza");
        savedEntity.setCategoryEntity(category);

        when(categoryRepo.findById(1)).thenReturn(Optional.of(category));
        when(menuRepo.save(any(MenuEntity.class))).thenReturn(savedEntity);

        MenuDto.Response result = menuService.createMenu(request);

        assertNotNull(result);
        assertEquals("Pizza", result.name());
        verify(categoryRepo, times(1)).findById(1);
        verify(menuRepo, times(1)).save(any(MenuEntity.class));
    }

    @Test
    void updateMenu_WhenFound_ShouldSaveAndReturnResponse() {
        MenuDto.UpdateRequest request = new MenuDto.UpdateRequest("Burger", 8, "url", "id", 1, true, 1);
        CategoryEntity category = new CategoryEntity(1, "Food", null);
        MenuEntity existing = new MenuEntity();
        existing.setId(1);
        existing.setName("Pizza");

        when(menuRepo.findById(1)).thenReturn(Optional.of(existing));
        when(categoryRepo.findById(1)).thenReturn(Optional.of(category));
        when(menuRepo.save(existing)).thenReturn(existing);

        MenuDto.Response result = menuService.updateMenu(1, request);

        assertNotNull(result);
        assertEquals("Burger", result.name());
        assertEquals(8, existing.getPrice());
    }

    @Test
    void deleteMenu_WhenFound_ShouldDelete() {
        MenuEntity existing = new MenuEntity();
        existing.setId(1);

        when(menuRepo.findById(1)).thenReturn(Optional.of(existing));

        assertDoesNotThrow(() -> menuService.deleteMenu(1));
        verify(menuRepo, times(1)).delete(existing);
    }
}
