package com.team.chatapp.controllers;

import com.team.chatapp.config.JwtConstants;
import com.team.chatapp.dto.response.ApiResponseDTO;
import com.team.chatapp.dto.response.MessageDTO;
import com.team.chatapp.exception.ChatException;
import com.team.chatapp.exception.MessageException;
import com.team.chatapp.exception.UserException;
import com.team.chatapp.model.Message;
import com.team.chatapp.model.MessageAttachment;
import com.team.chatapp.model.User;
import com.team.chatapp.service.AttachmentStorageService;
import com.team.chatapp.service.MessageService;
import com.team.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {

    private final UserService userService;
    private final MessageService messageService;
    private final AttachmentStorageService attachmentStorageService;

    @PostMapping("/create")
    public ResponseEntity<MessageDTO> sendMessage(@RequestParam UUID chatId,
                                                  @RequestParam(required = false) String content,
                                                  @RequestPart(value = "attachments", required = false) MultipartFile[] attachments,
                                                  @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws ChatException, UserException, MessageException {

        User user = userService.findUserByProfile(jwt);

        String sanitizedContent = content == null ? null : content.trim();
        List<MultipartFile> filesToStore = attachments == null ? List.of() : Arrays.stream(attachments)
                .filter(file -> file != null && !file.isEmpty())
                .toList();

        if ((sanitizedContent == null || sanitizedContent.isBlank()) && filesToStore.isEmpty()) {
            throw new MessageException("Message cannot be empty");
        }

        List<MessageAttachment> storedAttachments = filesToStore.isEmpty()
                ? List.of()
                : attachmentStorageService.storeFiles(chatId, user.getId(), filesToStore);

        Message message = messageService.sendMessage(chatId,
                sanitizedContent == null || sanitizedContent.isBlank() ? null : sanitizedContent,
                storedAttachments,
                user.getId());
        log.info("User {} sent message: {}", user.getEmail(), message.getId());

        return new ResponseEntity<>(MessageDTO.fromMessage(message), HttpStatus.OK);
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageDTO>> getChatMessages(@PathVariable UUID chatId,
                                                         @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws ChatException, UserException {

        User user = userService.findUserByProfile(jwt);
        List<Message> messages = messageService.getChatMessages(chatId, user);

        return new ResponseEntity<>(MessageDTO.fromMessages(messages), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> deleteMessage(@PathVariable UUID id,
                                                        @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, MessageException {

        User user = userService.findUserByProfile(jwt);
        messageService.deleteMessageById(id, user);
        log.info("User {} deleted message: {}", user.getEmail(), id);

        ApiResponseDTO res = ApiResponseDTO.builder()
                .message("Message deleted successfully")
                .status(true)
                .build();

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

}
