package com.team.chatapp.controllers;

import com.team.chatapp.model.Message;
import com.team.chatapp.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class RealtimeChatController {
    
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/messages")
    public void receiveMessage(@Payload Message message) {
        // Send message to all users in chat
        for (User user : message.getChat().getUsers()) {
            final String destination = "/topic/" + user.getId();
            messagingTemplate.convertAndSend(destination, message);
        }
    }

    @MessageMapping("/typing")
    public void handleTyping(@Payload Map<String, Object> payload) {
        // Parse the payload values properly - they come as numbers, not strings
        Object chatIdObj = payload.get("chatId");
        Object userIdObj = payload.get("userId");
        
        Integer chatId = chatIdObj instanceof Number ? ((Number) chatIdObj).intValue() : Integer.parseInt(chatIdObj.toString());
        Integer userId = userIdObj instanceof Number ? ((Number) userIdObj).intValue() : Integer.parseInt(userIdObj.toString());
        
        // Log the typing event
        log.info("Typing event - chatId: {}, userId: {}, isTyping: {}", chatId, userId, payload.get("isTyping"));
        
        // Send typing status to the chat topic
        messagingTemplate.convertAndSend("/topic/typing/" + chatId, payload);
    }

}
