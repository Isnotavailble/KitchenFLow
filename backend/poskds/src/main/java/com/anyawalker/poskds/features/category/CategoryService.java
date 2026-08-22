package com.anyawalker.poskds.features.category;

import com.anyawalker.poskds.features.category.dtos.CategoryRequest;
import com.anyawalker.poskds.features.category.dtos.CategoryResponse;
import com.anyawalker.poskds.models.CategoryEntity;
import com.anyawalker.poskds.repos.CategoryRepo;
import com.anyawalker.poskds.repos.MenuRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepo categoryRepo;
    private final MenuRepo menuRepo;

    public CategoryService(CategoryRepo categoryRepo, MenuRepo menuRepo) {
        this.categoryRepo = categoryRepo;
        this.menuRepo = menuRepo;
    }


    // 1 single database query with LEFT JOIN & COUNT(m.id) GROUP BY
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepo.findActiveCategoryResponses();
    }

    // 1 single database query with LEFT JOIN & COUNT(m.id) GROUP BY
    public List<CategoryResponse> getAllCategoriesAdmin() {
        return categoryRepo.findAllCategoryResponses();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (request == null || request.name() == null || request.name().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name cannot be empty");
        }
        String cleanName = request.name().trim();
        if (categoryRepo.findByNameIgnoreCase(cleanName).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category with name '" + cleanName + "' already exists");
        }

        CategoryEntity entity = new CategoryEntity();
        entity.setName(cleanName);
        entity.setDeleted(false);
        CategoryEntity saved = categoryRepo.save(entity);

        return new CategoryResponse(saved.getId(), saved.getName(), saved.isDeleted(), 0);
    }

    @Transactional
    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        CategoryEntity entity = categoryRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found with id: " + id));

        if (request == null || request.name() == null || request.name().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name cannot be empty");
        }
        String cleanName = request.name().trim();
        if (categoryRepo.existsByNameIgnoreCaseAndIdNot(cleanName, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category with name '" + cleanName + "' already exists");
        }

        entity.setName(cleanName);
        CategoryEntity saved = categoryRepo.save(entity);

        long count = menuRepo.countByCategoryEntity_Id(saved.getId());
        return new CategoryResponse(saved.getId(), saved.getName(), saved.isDeleted(), count);
    }

    @Transactional
    public CategoryResponse toggleCategorySoftDelete(Integer id, Boolean deleted) {
        CategoryEntity entity = categoryRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found with id: " + id));

        boolean newDeletedState = deleted != null ? deleted : !entity.isDeleted();
        entity.setDeleted(newDeletedState);

        // Atomic bulk update: disables all child dishes in 1 query
        if (newDeletedState) {
            int disabledCount = menuRepo.disableAllMenusByCategoryId(id);
            log.info("Soft-deleted category [ID: {}, Name: '{}']: disabled {} child menu items", id, entity.getName(), disabledCount);
        }

        CategoryEntity saved = categoryRepo.save(entity);
        long count = menuRepo.countByCategoryEntity_Id(saved.getId());
        return new CategoryResponse(saved.getId(), saved.getName(), saved.isDeleted(), count);
    }

    @Transactional
    public void hardDeleteCategory(Integer id, Integer targetCategoryId, Boolean deleteChildItems) {
        CategoryEntity entity = categoryRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found with id: " + id));

        long childCount = menuRepo.countByCategoryEntity_Id(id);

        if (childCount > 0) {
            if (targetCategoryId != null) {
                if (targetCategoryId.equals(id)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target category cannot be the same as the deleted category");
                }
                CategoryEntity targetCategory = categoryRepo.findById(targetCategoryId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target category not found with id: " + targetCategoryId));

                // Atomic bulk update: reassigns all child dishes to target category in 1 query
                int reassignedCount = menuRepo.reassignCategoryForMenus(id, targetCategory);
                log.info("Hard-deleting category [ID: {}, Name: '{}']: reassigned {} menu items to category [ID: {}, Name: '{}']",
                        id, entity.getName(), reassignedCount, targetCategoryId, targetCategory.getName());
            } else if (Boolean.TRUE.equals(deleteChildItems)) {
                // Atomic bulk delete: deletes all child dishes in 1 query
                int deletedCount = menuRepo.deleteMenusByCategoryId(id);
                log.info("Hard-deleting category [ID: {}, Name: '{}']: deleted {} child menu items", id, entity.getName(), deletedCount);
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category contains " + childCount + " menu items. Please reassign or delete them first.");
            }
        }

        categoryRepo.delete(entity);
        log.info("Permanently deleted category [ID: {}, Name: '{}']", id, entity.getName());
    }
}



