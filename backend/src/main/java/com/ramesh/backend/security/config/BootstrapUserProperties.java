package com.ramesh.backend.security.config;

import com.ramesh.backend.dto.UserProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix="app")
public record BootstrapUserProperties(
        List<UserProperties> bootstrapUsers
) {
}
