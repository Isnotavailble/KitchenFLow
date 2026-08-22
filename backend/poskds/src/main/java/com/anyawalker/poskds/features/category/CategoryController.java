package com.anyawalker.poskds.features.category;

import com.anyawalker.poskds.features.category.dtos.CategoryRequest;
import com.anyawalker.poskds.features.category.dtos.CategoryResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.anyawalker.poskds.features.eventlistener.EventEmitterService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final EventEmitterService<Object> eventEmitterService;

    public CategoryController(CategoryService categoryService, EventEmitterService<Object> eventEmitterService) {
        this.categoryService = categoryService;
        this.eventEmitterService = eventEmitterService;
    }

    private void broadcastCategoryUpdate(Object data) {
        eventEmitterService.publish("ROLE_ADMIN", "category-updated", data);
    }

    // GET /api/categories - Active categories for POS / Menu / KDS
    @GetMapping
    public ResponseEntity<?> getActiveCategories() {
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }

    // GET /api/categories/admin - All categories with deleted state and item count (Admin only)
    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllCategoriesAdmin() {
        return ResponseEntity.ok(categoryService.getAllCategoriesAdmin());
    }

    // POST /api/categories - Create category (Admin only)
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        broadcastCategoryUpdate(response);
        return ResponseEntity.ok(response);
    }

    // PUT /api/categories/{id} - Rename / edit category (Admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateCategory(
            @PathVariable Integer id,
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        broadcastCategoryUpdate(response);
        return ResponseEntity.ok(response);
    }

    // PATCH /api/categories/{id}/toggle?deleted={bool} - Soft delete / toggle active (Admin only)
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> toggleCategorySoftDelete(
            @PathVariable Integer id,
            @RequestParam(required = false) Boolean deleted
    ) {
        CategoryResponse response = categoryService.toggleCategorySoftDelete(id, deleted);
        broadcastCategoryUpdate(response);
        return ResponseEntity.ok(response);
    }

    // DELETE /api/categories/{id}?targetCategoryId={id}&deleteChildItems={bool} - Hard delete (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> hardDeleteCategory(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer targetCategoryId,
            @RequestParam(required = false, defaultValue = "false") Boolean deleteChildItems
    ) {
        categoryService.hardDeleteCategory(id, targetCategoryId, deleteChildItems);
        broadcastCategoryUpdate(Map.of("id", id, "deleted", true));
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully", "id", id));
    }
}


