package com.team.chatapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "message_attachments")
public class MessageAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "original_name")
    private String originalName;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size")
    private Long size;

    @Column(name = "file_url")
    private String fileUrl;

    @Builder.Default
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt = LocalDateTime.now();

}
