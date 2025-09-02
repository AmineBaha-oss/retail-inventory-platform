package com.retailinventory.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configuration for WebClient to communicate with external services.
 */
@Configuration
public class WebClientConfig {

    @Value("${app.ml-service.base-url:http://localhost:8000}")
    private String mlServiceBaseUrl;

    @Bean
    public WebClient mlWebClient() {
        return WebClient.builder()
                .baseUrl(mlServiceBaseUrl)
                .build();
    }
}
