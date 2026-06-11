package com.anyawalker.poskds.features.postconstruct;

import com.anyawalker.poskds.models.entities.User;
import com.anyawalker.poskds.repos.UserRepo;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class PreUpdateUserTable {
    Logger log = LoggerFactory.getLogger(PreUpdateUserTable.class);
    private final PasswordEncoder passwordEncoder;
    private final UserRepo userRepo;
    public PreUpdateUserTable(PasswordEncoder passwordEncoder,UserRepo userRepo){
        this.passwordEncoder = passwordEncoder;
        this.userRepo = userRepo;
    }
    @PostConstruct
    public void doInit(){
        log.info("Start Post construct on user table");

        if (userRepo.findByEmail("kaungkaung272005@gmail.com").isEmpty()){
            User user = new User();
            user.setUsername("kaung kaung");
            user.setEmail("kaungkaung272005@gmail.com");
            user.setRole("ROLE_ADMIN");
            user.setPassword(passwordEncoder.encode("Kk722005#"));
            userRepo.save(user);
        }


    }
}
