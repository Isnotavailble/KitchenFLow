package com.anyawalker.poskds.features.postconstruct;

import com.anyawalker.poskds.models.CategoryEntity;
import com.anyawalker.poskds.repos.CategoryRepo;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("preUpdateCategoryTable")
@DependsOn("preUpdateUserTable")
public class PreUpdateCategoryTable {
    private final Logger log = LoggerFactory.getLogger(PreUpdateCategoryTable.class);
    private final CategoryRepo categoryRepo;

    public PreUpdateCategoryTable(CategoryRepo categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    @PostConstruct
    public void doInit() {
        log.info("Start Post construct on category table");

        List<String> categories = List.of("Burgers", "Wraps", "Pizzas", "Salads", "Beverages");
        for (String catName : categories) {
            if (categoryRepo.findByName(catName) == null) {
                CategoryEntity cat = new CategoryEntity();
                cat.setName(catName);
                categoryRepo.save(cat);
            }
        }
        log.info("Category table seeded successfully with 5 categories.");
    }
}
