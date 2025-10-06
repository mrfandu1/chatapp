package com.team.chatapp.dto.response;

import com.team.chatapp.model.Message;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.*;

@Builder
public record MessageDTO(
    UUID id,
    String content,
    LocalDateTime timeStamp,
    UserDTO user,
    Set<UUID> readBy,
    List<MessageAttachmentDTO> attachments) {

    public static MessageDTO fromMessage(Message message) {
        if (Objects.isNull(message)) return null;
        return MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .timeStamp(message.getTimeStamp())
                .user(UserDTO.fromUser(message.getUser()))
                .readBy(new HashSet<>(message.getReadBy()))
        .attachments(message.getAttachments() == null
            ? List.of()
            : message.getAttachments().stream()
            .map(MessageAttachmentDTO::fromAttachment)
            .filter(Objects::nonNull)
            .toList())
                .build();
    }

    public static List<MessageDTO> fromMessages(Collection<Message> messages) {
        if (Objects.isNull(messages)) return List.of();
        return messages.stream()
                .map(MessageDTO::fromMessage)
                .toList();
    }

}
