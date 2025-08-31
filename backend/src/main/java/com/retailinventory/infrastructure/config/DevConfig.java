package com.retailinventory.infrastructure.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Development configuration that disables external service dependencies.
 */
@Configuration
@Profile("dev")
@EnableAutoConfiguration(exclude = {
    RedisAutoConfiguration.class,
    KafkaAutoConfiguration.class
})
public class DevConfig {
    // This configuration will disable Redis and Kafka auto-configuration in dev profile
}
