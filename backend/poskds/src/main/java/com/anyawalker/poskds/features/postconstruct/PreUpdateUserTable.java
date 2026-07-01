package com.anyawalker.poskds.features.postconstruct;

import com.anyawalker.poskds.models.UserEntity;
import com.anyawalker.poskds.repos.UserRepo;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

        if (userRepo.findByMobileNumber("09123456789").isEmpty()){
            UserEntity userEntity = new UserEntity();
            userEntity.setUsername("kaung kaung");
            userEntity.setMobileNumber("09123456789");
            userEntity.setRole("ROLE_ADMIN");
            userEntity.setPassword(passwordEncoder.encode("Kk722005#"));
            userRepo.save(userEntity);
        }

        if (userRepo.findByMobileNumber("09111111111").isEmpty()){
            UserEntity userEntity = new UserEntity();
            userEntity.setUsername("cashier1");
            userEntity.setMobileNumber("09111111111");
            userEntity.setRole("ROLE_CASHIER");
            userEntity.setPassword(passwordEncoder.encode("Cashier123#"));
            userRepo.save(userEntity);
        }

        if (userRepo.findByMobileNumber("09222222222").isEmpty()){
            UserEntity userEntity = new UserEntity();
            userEntity.setUsername("cashier2");
            userEntity.setMobileNumber("09222222222");
            userEntity.setRole("ROLE_CASHIER");
            userEntity.setPassword(passwordEncoder.encode("Cashier123#"));
            userRepo.save(userEntity);
        }
        if (userRepo.findByMobileNumber("09333333333").isEmpty()){
            UserEntity userEntity = new UserEntity();
            userEntity.setUsername("chef1");
            userEntity.setMobileNumber("09333333333");
            userEntity.setRole("ROLE_CHEF");
            userEntity.setPassword(passwordEncoder.encode("Chef123#"));
            userRepo.save(userEntity);
        }


    }
}
