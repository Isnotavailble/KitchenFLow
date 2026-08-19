package com.anyawalker.poskds.features.auth;

import com.anyawalker.poskds.models.UserEntity;
import com.anyawalker.poskds.repos.UserRepo;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

//this is for AuthConfig to interact with my user table
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepo userRepo;
    public CustomUserDetailsService(UserRepo userRepo){
        this.userRepo = userRepo;
    }

    @Override
    @NonNull
    public UserDetails loadUserByUsername( @NonNull String mobileNumber) throws UsernameNotFoundException {

        Optional<UserEntity> user = userRepo.findByMobileNumber(mobileNumber);

        if (user.isEmpty())
            throw new UsernameNotFoundException("User with this name doesn't exist");


        UserEntity userEntity = user.get();
        return org.springframework.security.core.userdetails.User.builder()
                .username(userEntity.getMobileNumber())
                .password(userEntity.getPassword())
                .roles(userEntity.getRole().replace("ROLE_", ""))
                .disabled(userEntity.isDeleted()) //activation or deactivation
                .build();
    }
}
