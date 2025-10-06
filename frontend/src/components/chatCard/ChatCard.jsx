import { Avatar, Badge, Tooltip } from '@mui/material';
import React from 'react';
import { getChatName, getInitialsFromName, transformDateToString } from '../utils/Utils';
import styles from './ChatCard.module.scss';
import { useSelector } from 'react-redux';

const ChatCard = ({ chat, isCompact = false }) => {
  const authState = useSelector(state => state.auth);

  const name = getChatName(chat, authState.reqUser);
  const initials = getInitialsFromName(name);
  
  const messages = Array.isArray(chat?.messages) ? chat.messages : [];
  const sortedMessages = [...messages].sort(
    (a, b) => +new Date(a.timeStamp) - +new Date(b.timeStamp)
  );
  const lastMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : undefined;
  const lastMessageContentRaw = lastMessage?.content ?? '';
  const lastMessageContent =
    lastMessageContentRaw.length > 25
      ? `${lastMessageContentRaw.slice(0, 25)}...`
      : lastMessageContentRaw;
  const lastMessageName = lastMessage
    ? lastMessage.user.fullName === authState.reqUser?.fullName
      ? 'You'
      : lastMessage.user.fullName
    : '';
  const lastMessageString = lastMessage ? `${lastMessageName}: ${lastMessageContent}` : '';
  const lastDate = lastMessage ? transformDateToString(new Date(lastMessage.timeStamp)) : '';
  const reqUserId = authState.reqUser?.id;
  const numberOfReadMessages = reqUserId
    ? messages.filter(msg => {
        const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
        return msg.user?.id === reqUserId || readBy.includes(reqUserId);
      }).length
    : 0;
  const numberOfUnreadMessages = messages.length - numberOfReadMessages;

  if (isCompact) {
    return (
      <Tooltip title={name} placement="right" arrow>
        <div className={`${styles.chatCardOuterContainer} ${styles.compact}`}>
          <Badge
            badgeContent={numberOfUnreadMessages}
            color="primary"
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Avatar
              sx={{
                width: '3rem',
                height: '3rem',
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
              }}
            >
              {initials}
            </Avatar>
          </Badge>
        </div>
      </Tooltip>
    );
  }

  return (
    <div className={styles.chatCardOuterContainer}>
      <div className={styles.chatCardAvatarContainer}>
        <Avatar
          sx={{
            width: '2.6rem',
            height: '2.6rem',
            fontSize: '1.05rem',
            mr: '0.75rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
          }}
        >
          {initials}
        </Avatar>
      </div>
      <div className={styles.chatCardContentContainer}>
        <div className={styles.chatCardContentInnerContainer}>
          <p className={styles.chatCardLargeTextContainer}>{name}</p>
          <p className={styles.chatCardSmallTextContainer}>{lastDate}</p>
        </div>
        <div className={styles.chatCardContentInnerContainer}>
          <p className={styles.chatCardSmallTextContainer}>{lastMessageString}</p>
          <Badge badgeContent={numberOfUnreadMessages} color="primary" sx={{ mr: '0.5rem' }} />
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
