package com.anyawalker.poskds.features.category;

import com.anyawalker.poskds.features.category.dtos.CategoryResponse;
import com.anyawalker.poskds.repos.CategoryRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepo categoryRepo;

    public CategoryController(CategoryRepo categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        List<CategoryResponse> categories = categoryRepo.findAll()
                .stream()
                .map(cat -> new CategoryResponse(cat.getId(), cat.getName()))
                .toList();
        return ResponseEntity.ok(categories);
    }
}
