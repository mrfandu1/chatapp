package com.team.chatapp.service.implementation;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.team.chatapp.exception.StorageException;
import com.team.chatapp.model.MessageAttachment;
import com.team.chatapp.service.AttachmentStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentStorageServiceImpl implements AttachmentStorageService {

    private final Cloudinary cloudinary;

    @Override
    public List<MessageAttachment> storeFiles(UUID chatId, UUID userId, List<MultipartFile> files) {
        List<MessageAttachment> attachments = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return attachments;
        }

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            try {
                // Use chat ID and user ID to create a unique folder structure in Cloudinary
                String folder = "chatapp/" + chatId.toString() + "/" + userId.toString();

                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", folder
                ));

                String url = (String) uploadResult.get("secure_url");
                String publicId = (String) uploadResult.get("public_id");

                attachments.add(MessageAttachment.builder()
                        .storagePath(publicId) // Store public_id as the path
                        .originalName(file.getOriginalFilename())
                        .contentType(file.getContentType())
                        .size(file.getSize())
                        .fileUrl(url) // Store the direct Cloudinary URL
                        .build());

                log.debug("Uploaded attachment {} to Cloudinary for chat {} by user {}", publicId, chatId, userId);

            } catch (IOException exception) {
                throw new StorageException("Failed to store file " + file.getOriginalFilename(), exception);
            }
        }

        return attachments;
    }

    @Override
    public Resource loadAsResource(UUID chatId, String fileName) {
        // This method is no longer needed if you serve files directly from Cloudinary.
        // You can leave it as is or have it throw an UnsupportedOperationException.
        // The frontend will now use the direct `fileUrl` from Cloudinary.
        throw new UnsupportedOperationException("Files are served directly from Cloudinary, not from the backend server.");
    }
}
