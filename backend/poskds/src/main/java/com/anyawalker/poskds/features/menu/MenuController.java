package com.anyawalker.poskds.features.menu;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/menu")
public class MenuController {
    private final MenuService menuService;
    public MenuController(MenuService menuService){
        this.menuService = menuService;
    }
    @GetMapping("/view_menus")
    public ResponseEntity<?> viewAllMenu(){
        return ResponseEntity.ok(menuService.getAllMenu());
    }

}
