package com.anyawalker.poskds.features.menu;

import com.anyawalker.poskds.features.menu.dtos.MenuDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/menu")
public class MenuController {
    private final MenuService menuService;
    public MenuController(MenuService menuService){
        this.menuService = menuService;
    }

    @GetMapping
    public ResponseEntity<?> viewAllMenu(){
        return ResponseEntity.ok(menuService.getAllMenu());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> viewMenuById(@PathVariable Integer id){
        return ResponseEntity.ok(menuService.getMenuById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createMenu(@RequestBody MenuDto.CreateRequest request){
        return ResponseEntity.ok(menuService.createMenu(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateMenu(@PathVariable Integer id, @RequestBody MenuDto.UpdateRequest request){
        return ResponseEntity.ok(menuService.updateMenu(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteMenu(@PathVariable Integer id){
        menuService.deleteMenu(id);
        return ResponseEntity.ok(Map.of("message","menu with Id" + id + "is deleted."));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize(("hasAuthority('ROLE_ADMIN')"))
    public ResponseEntity<?> toggleMenuItems(@PathVariable Integer id,@RequestParam Boolean value){
        return ResponseEntity.ok(menuService.toggleMenuItem(id,value));
    }
}
