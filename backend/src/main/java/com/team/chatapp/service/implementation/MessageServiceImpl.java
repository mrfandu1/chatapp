package com.team.chatapp.service.implementation;

import com.team.chatapp.exception.ChatException;
import com.team.chatapp.exception.MessageException;
import com.team.chatapp.exception.UserException;
import com.team.chatapp.model.Chat;
import com.team.chatapp.model.Message;
import com.team.chatapp.model.MessageAttachment;
import com.team.chatapp.model.User;
import com.team.chatapp.repository.MessageRepository;
import com.team.chatapp.service.ChatService;
import com.team.chatapp.service.MessageService;
import com.team.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageService {

    private final UserService userService;
    private final ChatService chatService;
    private final MessageRepository messageRepository;

    @Override
    public Message sendMessage(UUID chatId, String content, List<MessageAttachment> attachments, UUID userId)
            throws UserException, ChatException {

        User user = userService.findUserById(userId);
        Chat chat = chatService.findChatById(chatId);

    List<MessageAttachment> safeAttachments = attachments == null
        ? new ArrayList<>()
        : new ArrayList<>(attachments);

        Message message = Message.builder()
                .chat(chat)
                .user(user)
                .content(content)
                .timeStamp(LocalDateTime.now())
        .readBy(new HashSet<>(Set.of(user.getId())))
                .build();

    if (!safeAttachments.isEmpty()) {
        safeAttachments.forEach(attachment -> attachment.setMessage(message));
        message.getAttachments().addAll(safeAttachments);
    }

        chat.getMessages().add(message);

        return messageRepository.save(message);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Message> getChatMessages(UUID chatId, User reqUser) throws UserException, ChatException {

        Chat chat = chatService.findChatById(chatId);

        if (!chat.getUsers().contains(reqUser)) {
            throw new UserException("User isn't related to chat " + chatId);
        }

        return messageRepository.findByChat_Id(chat.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Message findMessageById(UUID messageId) throws MessageException {

        Optional<Message> message = messageRepository.findById(messageId);

        if (message.isPresent()) {
            return message.get();
        }

        throw new MessageException("Message not found " + messageId);
    }

    @Override
    public void deleteMessageById(UUID messageId, User reqUser) throws UserException, MessageException {

        Message message = findMessageById(messageId);

        if (message.getUser().getId().equals(reqUser.getId())) {
            messageRepository.deleteById(messageId);
            return;
        }

        throw new UserException("User is not related to message " + message.getId());
    }

}
