package com.team.chatapp.service;

import com.team.chatapp.model.MessageAttachment;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface AttachmentStorageService {

    List<MessageAttachment> storeFiles(UUID chatId, UUID userId, List<MultipartFile> files);

    Resource loadAsResource(UUID chatId, String fileName);

}
