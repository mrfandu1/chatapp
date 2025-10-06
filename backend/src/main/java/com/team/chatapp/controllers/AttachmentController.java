package com.team.chatapp.controllers;

import com.team.chatapp.exception.StorageException;
import com.team.chatapp.service.AttachmentStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/files")
public class AttachmentController {

    private final AttachmentStorageService attachmentStorageService;

    @GetMapping("/{chatId}/{fileName:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable UUID chatId, @PathVariable String fileName) {
        try {
            Resource resource = attachmentStorageService.loadAsResource(chatId, fileName);
            MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .contentType(mediaType)
                    .body(resource);
        } catch (StorageException exception) {
            return ResponseEntity.notFound().build();
        }
    }
}
