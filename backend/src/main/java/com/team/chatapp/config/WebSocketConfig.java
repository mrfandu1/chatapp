package com.team.chatapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toArray(String[]::new);

        if (origins.length == 0) {
            origins = new String[]{"*"};
        }

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(origins)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic/");
        registry.setApplicationDestinationPrefixes("/app");
    }

}
