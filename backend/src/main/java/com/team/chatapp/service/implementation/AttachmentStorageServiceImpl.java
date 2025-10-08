package com.team.chatapp.service.implementation;

import com.team.chatapp.exception.StorageException;
import com.team.chatapp.model.MessageAttachment;
import com.team.chatapp.service.AttachmentStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class AttachmentStorageServiceImpl implements AttachmentStorageService {

    private final Path rootLocation;

    public AttachmentStorageServiceImpl(@Value("${app.storage.upload-dir:uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        init();
    }

    @Override
    public List<MessageAttachment> storeFiles(UUID chatId, UUID userId, List<MultipartFile> files) {
        List<MessageAttachment> attachments = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return attachments;
        }

        Path chatDirectory = rootLocation.resolve(chatId.toString());
        try {
            Files.createDirectories(chatDirectory);
        } catch (IOException exception) {
            throw new StorageException("Could not create chat directory for attachments", exception);
        }

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String originalName = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
            if (originalName.contains("..")) {
                throw new StorageException("Cannot store file with relative path outside current directory: " + originalName);
            }

            String extension = StringUtils.getFilenameExtension(originalName);
            String generatedName = UUID.randomUUID().toString();
            String storedFileName = extension == null || extension.isBlank()
                    ? generatedName
                    : generatedName + "." + extension;

            Path destination = chatDirectory.resolve(storedFileName);
            try {
                Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException exception) {
                throw new StorageException("Failed to store file " + originalName, exception);
            }

        String storagePath = chatId + "/" + storedFileName;
        String accessibleUrl = "/api/files/" + storagePath;
            attachments.add(MessageAttachment.builder()
                    .storagePath(storagePath)
                    .originalName(originalName)
                    .contentType(file.getContentType())
                    .size(file.getSize())
            .fileUrl(accessibleUrl)
                    .build());

            log.debug("Saved attachment {} for chat {} by user {}", storedFileName, chatId, userId);
        }

        return attachments;
    }

    @Override
    public Resource loadAsResource(UUID chatId, String fileName) {
        try {
            Path filePath = rootLocation.resolve(chatId.toString()).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
        } catch (MalformedURLException exception) {
            throw new StorageException("Could not read file: " + fileName, exception);
        }

        throw new StorageException("File not found: " + fileName);
    }

    private void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException exception) {
            throw new StorageException("Could not initialize storage", exception);
        }
    }
}
