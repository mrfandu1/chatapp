package com.team.chatapp.service;

import com.team.chatapp.exception.ChatException;
import com.team.chatapp.exception.MessageException;
import com.team.chatapp.exception.UserException;
import com.team.chatapp.model.Message;
import com.team.chatapp.model.MessageAttachment;
import com.team.chatapp.model.User;

import java.util.List;
import java.util.UUID;

public interface MessageService {

    Message sendMessage(UUID chatId, String content, List<MessageAttachment> attachments, UUID userId)
            throws UserException, ChatException;

    List<Message> getChatMessages(UUID chatId, User reqUser) throws UserException, ChatException;

    Message findMessageById(UUID messageId) throws MessageException;

    void deleteMessageById(UUID messageId, User reqUser) throws UserException, MessageException;

}
