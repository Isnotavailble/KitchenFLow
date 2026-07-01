package com.anyawalker.poskds.features.postconstruct;

import com.anyawalker.poskds.models.entities.CategoryEntity;
import com.anyawalker.poskds.models.entities.MenuEntity;
import com.anyawalker.poskds.repos.CategoryRepo;
import com.anyawalker.poskds.repos.MenuRepo;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

@Component("preUpdateMenuTable")
@DependsOn("preUpdateCategoryTable")
public class PreUpdateMenuTable {
    private final Logger log = LoggerFactory.getLogger(PreUpdateMenuTable.class);
    private final MenuRepo menuRepo;
    private final CategoryRepo categoryRepo;

    public PreUpdateMenuTable(MenuRepo menuRepo, CategoryRepo categoryRepo) {
        this.menuRepo = menuRepo;
        this.categoryRepo = categoryRepo;
    }

    @PostConstruct
    public void doInit() {
        log.info("Start Post construct on menu table");

        if (menuRepo.count() == 0) {
            log.info("Seeding 5 Myanglish menu items...");

            CategoryEntity noodles = categoryRepo.findByName("Noodles");
            CategoryEntity salad = categoryRepo.findByName("Salad");
            CategoryEntity snack = categoryRepo.findByName("Snack");

            MenuEntity shanKhaukSwew = new MenuEntity();
            shanKhaukSwew.setName("Shan Khauk Swew");
            shanKhaukSwew.setCategoryEntity(noodles);
            shanKhaukSwew.setPrice(3000);
            shanKhaukSwew.setAvailable(true);
            shanKhaukSwew.setWorkloadTier(2); // medium
            menuRepo.save(shanKhaukSwew);

            MenuEntity moteHinGar = new MenuEntity();
            moteHinGar.setName("Mote Hin Gar");
            moteHinGar.setCategoryEntity(noodles);
            moteHinGar.setPrice(2500);
            moteHinGar.setAvailable(true);
            moteHinGar.setWorkloadTier(1); // fast
            menuRepo.save(moteHinGar);

            MenuEntity lahpetThoke = new MenuEntity();
            lahpetThoke.setName("Lahpet Thoke");
            lahpetThoke.setCategoryEntity(salad);
            lahpetThoke.setPrice(2000);
            lahpetThoke.setAvailable(true);
            lahpetThoke.setWorkloadTier(1); // fast
            menuRepo.save(lahpetThoke);

            MenuEntity tofuKyaw = new MenuEntity();
            tofuKyaw.setName("Tofu Kyaw");
            tofuKyaw.setCategoryEntity(snack);
            tofuKyaw.setPrice(1500);
            tofuKyaw.setAvailable(true);
            tofuKyaw.setWorkloadTier(2); // medium
            menuRepo.save(tofuKyaw);

            MenuEntity ohnNoKhaukSwew = new MenuEntity();
            ohnNoKhaukSwew.setName("Ohn No Khauk Swew");
            ohnNoKhaukSwew.setCategoryEntity(noodles);
            ohnNoKhaukSwew.setPrice(3500);
            ohnNoKhaukSwew.setAvailable(true);
            ohnNoKhaukSwew.setWorkloadTier(2); // medium
            menuRepo.save(ohnNoKhaukSwew);

            log.info("Menu table seeded successfully.");
        }
    }
}
