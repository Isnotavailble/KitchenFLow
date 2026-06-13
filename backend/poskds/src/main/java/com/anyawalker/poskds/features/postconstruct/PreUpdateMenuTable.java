package com.anyawalker.poskds.features.postconstruct;

import com.anyawalker.poskds.models.entities.MenuEntity;
import com.anyawalker.poskds.repos.MenuRepo;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

@Component
public class PreUpdateMenuTable {
    private final Logger log = LoggerFactory.getLogger(PreUpdateMenuTable.class);
    private final MenuRepo menuRepo;

    public PreUpdateMenuTable(MenuRepo menuRepo) {
        this.menuRepo = menuRepo;
    }

    @PostConstruct
    @DependsOn("preUpdateUserTable")
    public void doInit() {
        log.info("Start Post construct on menu table");

        if (menuRepo.count() == 0) {
            log.info("Seeding 5 Myanglish menu items...");

            MenuEntity shanKhaukSwew = new MenuEntity();
            shanKhaukSwew.setName("Shan Khauk Swew");
            shanKhaukSwew.setCategoryName("Noodles");
            shanKhaukSwew.setCurrentPrice(3000);
            shanKhaukSwew.setAvailable(true);
            menuRepo.save(shanKhaukSwew);

            MenuEntity moteHinGar = new MenuEntity();
            moteHinGar.setName("Mote Hin Gar");
            moteHinGar.setCategoryName("Noodles");
            moteHinGar.setCurrentPrice(2500);
            moteHinGar.setAvailable(true);
            menuRepo.save(moteHinGar);

            MenuEntity lahpetThoke = new MenuEntity();
            lahpetThoke.setName("Lahpet Thoke");
            lahpetThoke.setCategoryName("Salad");
            lahpetThoke.setCurrentPrice(2000);
            lahpetThoke.setAvailable(true);
            menuRepo.save(lahpetThoke);

            MenuEntity tofuKyaw = new MenuEntity();
            tofuKyaw.setName("Tofu Kyaw");
            tofuKyaw.setCategoryName("Snack");
            tofuKyaw.setCurrentPrice(1500);
            tofuKyaw.setAvailable(true);
            menuRepo.save(tofuKyaw);

            MenuEntity ohnNoKhaukSwew = new MenuEntity();
            ohnNoKhaukSwew.setName("Ohn No Khauk Swew");
            ohnNoKhaukSwew.setCategoryName("Noodles");
            ohnNoKhaukSwew.setCurrentPrice(3500);
            ohnNoKhaukSwew.setAvailable(true);
            menuRepo.save(ohnNoKhaukSwew);

            log.info("Menu table seeded successfully.");
        }
    }
}
