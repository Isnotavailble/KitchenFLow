package com.anyawalker.poskds.features.menu;

import com.anyawalker.poskds.features.eventlistener.EventEmitterService;
import com.anyawalker.poskds.features.menu.dtos.MenuDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/menu")
public class MenuController {
    private final MenuService menuService;
    private final EventEmitterService<Object> eventEmitterService;

    public MenuController(MenuService menuService, EventEmitterService<Object> eventEmitterService){
        this.menuService = menuService;
        this.eventEmitterService = eventEmitterService;
    }

    private void broadcastMenuUpdate(Object data) {
        List<String> roles = List.of("ROLE_ADMIN", "ROLE_CASHIER", "ROLE_CHEF");
        for (String role : roles) {
            eventEmitterService.publish(role, "menu-updated", data);
        }
    }

    @GetMapping
    public ResponseEntity<?> viewMenus(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(menuService.getMenus(category, search, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> viewMenuById(@PathVariable Integer id){
        return ResponseEntity.ok(menuService.getMenuById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createMenu(@RequestBody MenuDto.CreateRequest request){
        MenuDto.Response response = menuService.createMenu(request);
        broadcastMenuUpdate(response);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateMenu(@PathVariable Integer id, @RequestBody MenuDto.UpdateRequest request){
        MenuDto.Response response = menuService.updateMenu(id, request);
        broadcastMenuUpdate(response);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteMenu(@PathVariable Integer id){
        menuService.deleteMenu(id);
        broadcastMenuUpdate(Map.of("id", id, "deleted", true));
        return ResponseEntity.ok(Map.of("message","menu with Id" + id + "is deleted."));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize(("hasAuthority('ROLE_ADMIN')"))
    public ResponseEntity<?> toggleMenuItems(@PathVariable Integer id,@RequestParam Boolean value){
        MenuDto.Response response = menuService.toggleMenuItem(id, value);
        broadcastMenuUpdate(response);
        return ResponseEntity.ok(response);
    }
}
