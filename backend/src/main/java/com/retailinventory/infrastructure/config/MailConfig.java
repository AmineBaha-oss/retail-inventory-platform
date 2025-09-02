package com.retailinventory.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Bean
    @Profile("dev")
    public JavaMailSender devMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("localhost");
        mailSender.setPort(1025);
        mailSender.setUsername("");
        mailSender.setPassword("");
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "false");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.debug", "true");
        
        return mailSender;
    }

    @Bean
    @Profile("!dev")
    public JavaMailSender prodMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        // Production mail configuration would go here
        // For now, use same as dev
        return devMailSender();
    }
}
