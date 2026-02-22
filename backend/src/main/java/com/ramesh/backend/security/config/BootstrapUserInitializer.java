package com.ramesh.backend.security.config;

import com.ramesh.backend.dto.UserProperties;
import com.ramesh.backend.entity.Role;
import com.ramesh.backend.entity.User;
import com.ramesh.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BootstrapUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(BootstrapUserInitializer.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BootstrapUserProperties properties;




    @Override
    public void run(String... args) throws Exception {

        for(UserProperties userProps : properties.bootstrapUsers()){
            if(!userRepository.existsByEmail(userProps.email())){
                User user = new User();
                user.setName(userProps.name());
                user.setEmail(userProps.email());
                user.setPassword(userProps.password());
                Set<Role> roles = userProps.roles()
                        .stream()
                        .map(Role::valueOf)
                        .collect(Collectors.toSet());
                user.setRoles(roles);
                userRepository.save(user);
                logger.info("Created bootstrap user: {}", userProps.email());
            }
        }

    }
}
