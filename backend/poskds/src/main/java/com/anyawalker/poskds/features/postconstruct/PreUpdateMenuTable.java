package com.anyawalker.poskds.features.postconstruct;

import com.anyawalker.poskds.models.CategoryEntity;
import com.anyawalker.poskds.models.MenuEntity;
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
            log.info("Seeding 10 casual menu items...");

            CategoryEntity burgers = categoryRepo.findByName("Burgers");
            CategoryEntity wraps = categoryRepo.findByName("Wraps");
            CategoryEntity pizzas = categoryRepo.findByName("Pizzas");
            CategoryEntity salads = categoryRepo.findByName("Salads");
            CategoryEntity beverages = categoryRepo.findByName("Beverages");

            // 1. Spicy Zinger Burger
            MenuEntity zinger = new MenuEntity();
            zinger.setName("Spicy Zinger Burger");
            zinger.setCategoryEntity(burgers);
            zinger.setPrice(850);
            zinger.setAvailable(true);
            zinger.setWorkloadTier(2); // medium (4 pts)
            zinger.setImageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80");
            zinger.setImageId("poskds/seed_zinger_burger");
            menuRepo.save(zinger);

            // 2. Mushroom Swiss Burger
            MenuEntity swiss = new MenuEntity();
            swiss.setName("Mushroom Swiss Burger");
            swiss.setCategoryEntity(burgers);
            swiss.setPrice(950);
            swiss.setAvailable(true);
            swiss.setWorkloadTier(2); // medium (4 pts)
            swiss.setImageUrl("https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80");
            swiss.setImageId("poskds/seed_mushroom_swiss");
            menuRepo.save(swiss);

            // 3. Classic Veggie Wrap
            MenuEntity veggieWrap = new MenuEntity();
            veggieWrap.setName("Classic Veggie Wrap");
            veggieWrap.setCategoryEntity(wraps);
            veggieWrap.setPrice(675);
            veggieWrap.setAvailable(true);
            veggieWrap.setWorkloadTier(1); // light (1 pt)
            veggieWrap.setImageUrl("https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80");
            veggieWrap.setImageId("poskds/seed_veggie_wrap");
            menuRepo.save(veggieWrap);

            // 4. Spicy Chicken Wrap (Unavailable for testing out-of-stock)
            MenuEntity spicyWrap = new MenuEntity();
            spicyWrap.setName("Spicy Chicken Wrap");
            spicyWrap.setCategoryEntity(wraps);
            spicyWrap.setPrice(795);
            spicyWrap.setAvailable(false);
            spicyWrap.setWorkloadTier(2); // medium (4 pts)
            spicyWrap.setImageUrl("https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80");
            spicyWrap.setImageId("poskds/seed_spicy_wrap");
            menuRepo.save(spicyWrap);

            // 5. Mediterranzer Pizza
            MenuEntity medPizza = new MenuEntity();
            medPizza.setName("Mediterranzer Pizza");
            medPizza.setCategoryEntity(pizzas);
            medPizza.setPrice(1450);
            medPizza.setAvailable(true);
            medPizza.setWorkloadTier(3); // heavy (10 pts)
            medPizza.setImageUrl("https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80");
            medPizza.setImageId("poskds/seed_med_pizza");
            menuRepo.save(medPizza);

            // 6. Classic Margherita Pizza (Unavailable for testing)
            MenuEntity margherita = new MenuEntity();
            margherita.setName("Classic Margherita Pizza");
            margherita.setCategoryEntity(pizzas);
            margherita.setPrice(1200);
            margherita.setAvailable(false);
            margherita.setWorkloadTier(3); // heavy (10 pts)
            margherita.setImageUrl("https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80");
            margherita.setImageId("poskds/seed_margherita");
            menuRepo.save(margherita);

            // 7. Vegan Caesar Salad
            MenuEntity caesar = new MenuEntity();
            caesar.setName("Vegan Caesar Salad");
            caesar.setCategoryEntity(salads);
            caesar.setPrice(750);
            caesar.setAvailable(true);
            caesar.setWorkloadTier(1); // light (1 pt)
            caesar.setImageUrl("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80");
            caesar.setImageId("poskds/seed_vegan_caesar");
            menuRepo.save(caesar);

            // 8. Crispy Tofu Power Bowl
            MenuEntity tofuBowl = new MenuEntity();
            tofuBowl.setName("Crispy Tofu Power Bowl");
            tofuBowl.setCategoryEntity(salads);
            tofuBowl.setPrice(900);
            tofuBowl.setAvailable(true);
            tofuBowl.setWorkloadTier(2); // medium (4 pts)
            tofuBowl.setImageUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80");
            tofuBowl.setImageId("poskds/seed_tofu_bowl");
            menuRepo.save(tofuBowl);

            // 9. Iced Citrus Lemonade
            MenuEntity lemonade = new MenuEntity();
            lemonade.setName("Iced Citrus Lemonade");
            lemonade.setCategoryEntity(beverages);
            lemonade.setPrice(350);
            lemonade.setAvailable(true);
            lemonade.setWorkloadTier(1); // light (1 pt)
            lemonade.setImageUrl("https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80");
            lemonade.setImageId("poskds/seed_citrus_lemonade");
            menuRepo.save(lemonade);

            // 10. Cold Brew Craft Coffee
            MenuEntity coldBrew = new MenuEntity();
            coldBrew.setName("Cold Brew Craft Coffee");
            coldBrew.setCategoryEntity(beverages);
            coldBrew.setPrice(425);
            coldBrew.setAvailable(true);
            coldBrew.setWorkloadTier(1); // light (1 pt)
            coldBrew.setImageUrl("https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80");
            coldBrew.setImageId("poskds/seed_cold_brew");
            menuRepo.save(coldBrew);

            log.info("Menu table seeded successfully with 10 casual menu items.");
        }
    }
}
