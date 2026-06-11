package com.anyawalker.poskds.features.auth;

import com.anyawalker.poskds.models.entities.User;
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
    public UserDetails loadUserByUsername( @NonNull String email) throws UsernameNotFoundException {

        Optional<User> user = userRepo.findByEmail(email);

        if (user.isEmpty())
            throw new UsernameNotFoundException("User with this name doesn't exist");


        return org.springframework.security.core.userdetails.User.builder()
                .username(user.get().getEmail())
                .password(user.get().getPassword())
                .roles(user.get().getRole().replace("ROLE_",""))
                .build();
    }
}
