package com.anyawalker.poskds.features.postconstruct;

import com.anyawalker.poskds.models.entities.UserEntity;
import com.anyawalker.poskds.repos.UserRepo;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.DependsOn;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
            UserEntity userEntity = new UserEntity();
            userEntity.setUsername("kaung kaung");
            userEntity.setEmail("kaungkaung272005@gmail.com");
            userEntity.setRole("ROLE_ADMIN");
            userEntity.setPassword(passwordEncoder.encode("Kk722005#"));
            userRepo.save(userEntity);
        }


    }
}
