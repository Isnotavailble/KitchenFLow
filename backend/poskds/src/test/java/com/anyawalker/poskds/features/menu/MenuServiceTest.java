package com.anyawalker.poskds.features.menu;

import com.anyawalker.poskds.features.menu.dtos.MenuDto;
import com.anyawalker.poskds.models.entities.MenuEntity;
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

    @InjectMocks
    private MenuService menuService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllMenu_ShouldReturnResponseList() {
        MenuEntity menuEntity = new MenuEntity();
        menuEntity.setId(1L);
        menuEntity.setName("Pizza");
        menuEntity.setCurrentPrice(10);
        menuEntity.setCookingDuration("fast");
        menuEntity.setCategoryName("Food");
        menuEntity.setAvailable(true);

        when(menuRepo.findAll()).thenReturn(List.of(menuEntity));

        List<MenuDto.Response> result = menuService.getAllMenu();

        assertEquals(1, result.size());
        assertEquals("Pizza", result.get(0).name());
        verify(menuRepo, times(1)).findAll();
    }

    @Test
    void getMenuById_WhenFound_ShouldReturnResponse() {
        MenuEntity menuEntity = new MenuEntity();
        menuEntity.setId(1L);
        menuEntity.setName("Pizza");

        when(menuRepo.findById(1L)).thenReturn(Optional.of(menuEntity));

        MenuDto.Response result = menuService.getMenuById(1L);

        assertNotNull(result);
        assertEquals("Pizza", result.name());
    }

    @Test
    void getMenuById_WhenNotFound_ShouldThrowException() {
        when(menuRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> menuService.getMenuById(1L));
    }

    @Test
    void createMenu_ShouldSaveAndReturnResponse() {
        MenuDto.CreateRequest request = new MenuDto.CreateRequest("Pizza", 10, "fast", "Food", true);
        MenuEntity savedEntity = new MenuEntity();
        savedEntity.setId(1L);
        savedEntity.setName("Pizza");

        when(menuRepo.save(any(MenuEntity.class))).thenReturn(savedEntity);

        MenuDto.Response result = menuService.createMenu(request);

        assertNotNull(result);
        assertEquals("Pizza", result.name());
        verify(menuRepo, times(1)).save(any(MenuEntity.class));
    }

    @Test
    void updateMenu_WhenFound_ShouldSaveAndReturnResponse() {
        MenuDto.UpdateRequest request = new MenuDto.UpdateRequest("Burger", 8, "fast", "Food", true);
        MenuEntity existing = new MenuEntity();
        existing.setId(1L);
        existing.setName("Pizza");

        when(menuRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(menuRepo.save(existing)).thenReturn(existing);

        MenuDto.Response result = menuService.updateMenu(1L, request);

        assertNotNull(result);
        assertEquals("Burger", result.name());
        assertEquals(8, existing.getCurrentPrice());
    }

    @Test
    void deleteMenu_WhenFound_ShouldDelete() {
        MenuEntity existing = new MenuEntity();
        existing.setId(1L);

        when(menuRepo.findById(1L)).thenReturn(Optional.of(existing));

        assertDoesNotThrow(() -> menuService.deleteMenu(1L));
        verify(menuRepo, times(1)).delete(existing);
    }
}
