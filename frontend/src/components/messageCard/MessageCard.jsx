import styles from './MessageCard.module.scss';
import { Avatar, Chip } from '@mui/material';
import React, { useState } from 'react';
import { getDateFormat, formatFileSize, getFileExtension, getInitialsFromName } from '../utils/Utils';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { BASE_API_URL } from '../../config/Config';

const MessageCard = ({ message, reqUser, isNewDate, isGroup }) => {
  const [showStatus, setShowStatus] = useState(false);
  const [showHoverInfo, setShowHoverInfo] = useState(false);
  const isOwnMessage = message.user.id === reqUser?.id;
  const date = new Date(message.timeStamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  const dayTime = `${dayName} ${hours12}:${minutes} ${ampm}`;
  
  // Check if message is read by checking readBy array
  // readBy is an array of user IDs (UUIDs as strings), not user objects
  // A message is "seen" if readBy includes any ID other than the sender's ID
  const senderId = String(message.user?.id || '');
  const isRead = message.readBy && Array.isArray(message.readBy) && message.readBy.length > 0 &&
    message.readBy.some(userId => String(userId) !== senderId && String(userId) !== '');
  const isDelivered = !isRead;
  
  // Debug: Log readBy structure for troubleshooting
  if (isOwnMessage && message.readBy) {
    console.log('Message ID:', message.id, 'ReadBy IDs:', message.readBy, 'Sender ID:', senderId, 'isRead:', isRead);
  }

  const attachments = message.attachments || [];

  // Separate media attachments from file attachments
  const mediaAttachments = attachments.filter(att => 
    att.contentType?.startsWith('image') || att.contentType?.startsWith('video')
  );
  const fileAttachments = attachments.filter(att => 
    !att.contentType?.startsWith('image') && !att.contentType?.startsWith('video')
  );

  // Helper function to get full URL for attachment
  const getAttachmentUrl = (url) => {
    if (!url) return '';
    // If URL is already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If URL starts with /, append to BASE_API_URL
    if (url.startsWith('/')) {
      return `${BASE_API_URL}${url}`;
    }
    // Otherwise prepend BASE_API_URL with /
    return `${BASE_API_URL}/${url}`;
  };

  // Helper function to get appropriate icon for file type
  const getFileIcon = (fileName, contentType) => {
    if (contentType?.includes('pdf') || fileName?.toLowerCase().endsWith('.pdf')) {
      return <PictureAsPdfIcon fontSize="small" />;
    }
    if (contentType?.includes('document') || contentType?.includes('word') ||
        fileName?.toLowerCase().match(/\.(doc|docx|txt|rtf)$/)) {
      return <DescriptionIcon fontSize="small" />;
    }
    return <InsertDriveFileIcon fontSize="small" />;
  };

  const label = (
    <div className={styles.bubbleContainer}>
      {isGroup && !isOwnMessage && (
        <h4 className={styles.contentContainer}>{message.user.fullName}:</h4>
      )}
      {fileAttachments.length > 0 && (
        <div className={styles.attachmentGrid}>
          {fileAttachments.map(attachment => {
            const fullUrl = getAttachmentUrl(attachment.url);
            
            return (
              <a
                key={`${message.id}-${attachment.url}`}
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fileAttachment}
              >
                <div className={styles.fileIcon}>
                  {getFileIcon(attachment.name, attachment.contentType)}
                </div>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{attachment.name || 'Download file'}</span>
                  {attachment.size && (
                    <span className={styles.fileSize}>{formatFileSize(attachment.size)}</span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
      {message.content && (
        <p 
          className={styles.contentContainer}
          onClick={() => setShowStatus(!showStatus)}
        >
          {message.content}
          {isOwnMessage && (
            <span className={styles.statusIconInline}>
              {isRead ? (
                <DoneAllIcon sx={{ fontSize: '0.75rem', color: '#0095f6', marginLeft: '4px' }} />
              ) : (
                <DoneAllIcon sx={{ fontSize: '0.75rem', color: '#8e8e8e', marginLeft: '4px' }} />
              )}
            </span>
          )}
        </p>
      )}
    </div>
  );

  const dateLabel = <p>{getDateFormat(date)}</p>;

  return (
    <div className={styles.messageCardInnerContainer}>
      {isNewDate && (
        <div className={styles.date}>
          <Chip
            label={dateLabel}
            sx={{
              height: 'auto',
              width: 'auto',
              backgroundColor: 'rgba(30, 30, 35, 0.6)',
              color: '#cbd5e1',
              px: 1.75,
              py: 0.65,
              fontSize: '0.8125rem',
              fontWeight: 500,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '1rem',
              backdropFilter: 'blur(10px)'
            }}
          />
        </div>
      )}
      <div className={isOwnMessage ? styles.ownMessage : styles.othersMessage}>
        {!isOwnMessage && (
          <Avatar
            className={styles.avatar}
            sx={{
              bgcolor: '#667eea',
              width: 32,
              height: 32,
              fontSize: '0.875rem',
              marginRight: '8px'
            }}
          >
            {getInitialsFromName(message.user.fullName)}
          </Avatar>
        )}
        <div 
          className={styles.messageContentWrapper}
          onMouseEnter={() => setShowHoverInfo(true)}
          onMouseLeave={() => setShowHoverInfo(false)}
        >
          {showHoverInfo && (
            <div className={isOwnMessage ? styles.hoverInfoOwn : styles.hoverInfoOther}>
              {dayTime}
            </div>
          )}
          {showStatus && isOwnMessage && (
            <div className={styles.statusInfo}>
              {isRead ? 'Seen' : 'Delivered'}
            </div>
          )}
          
          {/* Render media attachments outside the chip */}
          {mediaAttachments.length > 0 && (
            <div className={styles.mediaContainer}>
              {mediaAttachments.map(attachment => {
                const fullUrl = getAttachmentUrl(attachment.url);
                const isImage = attachment.contentType?.startsWith('image');
                const isVideo = attachment.contentType?.startsWith('video');
                
                if (isImage) {
                  return (
                    <a
                      key={`${message.id}-${attachment.url}`}
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.imageAttachment}
                    >
                      <img src={fullUrl} alt={attachment.name || 'attachment'} />
                    </a>
                  );
                }

                if (isVideo) {
                  return (
                    <a
                      key={`${message.id}-${attachment.url}`}
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.videoAttachment}
                    >
                      <video 
                        src={fullUrl} 
                        className={styles.videoPreview}
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className={styles.videoOverlay}>
                        <PlayCircleOutlineIcon className={styles.playIcon} />
                      </div>
                      <div className={styles.videoDuration}>0:12</div>
                    </a>
                  );
                }
                return null;
              })}
            </div>
          )}
          
          {/* Render text and files in chip only if there's content or files */}
          {(message.content || fileAttachments.length > 0 || (isGroup && !isOwnMessage)) && (
            <Chip
              label={label}
              sx={{
                height: 'auto',
                width: 'auto',
                backgroundColor: isOwnMessage 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'var(--bg-hover, rgba(30, 30, 35, 0.95))',
                background: isOwnMessage
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'var(--bg-hover, rgba(30, 30, 35, 0.95))',
                color: '#ffffff',
                borderRadius: '1.25rem',
                border: isOwnMessage ? 'none' : '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '0',
                '& .MuiChip-label': {
                  padding: 0,
                  overflow: 'visible'
                },
                '.light-mode &': {
                  background: isOwnMessage
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#e5e7eb',
                  color: isOwnMessage ? '#ffffff' : '#1f2937',
                  border: isOwnMessage ? 'none' : '1px solid #d1d5db'
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
