import React from 'react';
import { Avatar } from '@mui/material';
import styles from './TypingIndicator.module.scss';

const TypingIndicator = ({ user }) => {
  return (
    <div className={styles.typingContainer}>
      {user && (
        <Avatar 
          src={user.profilePicture} 
          alt={user.fullName}
          className={styles.avatar}
          sx={{ width: 32, height: 32 }}
        />
      )}
      <div className={styles.typingBubble}>
        <div className={styles.typingDots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
