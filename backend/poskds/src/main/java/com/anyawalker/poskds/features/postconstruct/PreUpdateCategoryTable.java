package com.anyawalker.poskds.features.postconstruct;

import com.anyawalker.poskds.models.entities.CategoryEntity;
import com.anyawalker.poskds.repos.CategoryRepo;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

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

        if (categoryRepo.count() == 0) {
            log.info("Seeding categories...");

            CategoryEntity noodles = new CategoryEntity();
            noodles.setName("Noodles");
            categoryRepo.save(noodles);

            CategoryEntity salad = new CategoryEntity();
            salad.setName("Salad");
            categoryRepo.save(salad);

            CategoryEntity snack = new CategoryEntity();
            snack.setName("Snack");
            categoryRepo.save(snack);

            log.info("Category table seeded successfully.");
        }
    }
}
