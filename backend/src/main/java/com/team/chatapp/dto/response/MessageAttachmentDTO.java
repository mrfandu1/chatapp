package com.team.chatapp.dto.response;

import com.team.chatapp.model.MessageAttachment;
import lombok.Builder;

import java.util.Objects;

@Builder
public record MessageAttachmentDTO(String name, String url, String contentType, Long size) {

    public static MessageAttachmentDTO fromAttachment(MessageAttachment attachment) {
        if (Objects.isNull(attachment)) {
            return null;
        }

    final String storagePath = attachment.getStoragePath();
    final String directUrl = attachment.getFileUrl();
    final String normalizedPath = storagePath != null && storagePath.startsWith("/")
        ? storagePath.substring(1)
        : storagePath;

        return MessageAttachmentDTO.builder()
                .name(attachment.getOriginalName())
        .url(directUrl != null ? directUrl : normalizedPath == null ? null : "/api/files/" + normalizedPath)
                .contentType(attachment.getContentType())
                .size(attachment.getSize())
                .build();
    }

}
