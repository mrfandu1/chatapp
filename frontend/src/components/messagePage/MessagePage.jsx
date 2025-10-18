import { Avatar, IconButton, InputAdornment, Menu, MenuItem, TextField, Tooltip } from '@mui/material';
import { getChatName, getInitialsFromName } from '../utils/Utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './MesaggePage.module.scss';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import MessageCard from '../messageCard/MessageCard';
import TypingIndicator from '../messageCard/TypingIndicator';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import { useDispatch } from 'react-redux';
import { deleteChat } from '../../redux/chat/ChatAction';
import { TOKEN } from '../../config/Config';
import EmojiPicker from 'emoji-picker-react';
import MoodIcon from '@mui/icons-material/Mood';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedArrowIcon } from '../../assets/sidebarVercelIcons';

const MessagePage = ({
  chat,
  reqUser,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  setIsShowEditGroupChat,
  setCurrentChat,
  stompClient,
  isConnected,
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  const [messageQuery, setMessageQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [attachmentAnchor, setAttachmentAnchor] = useState(null);
  const [pendingUploads, setPendingUploads] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const lastMessageRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const open = Boolean(anchor);
  const isAttachmentMenuOpen = Boolean(attachmentAnchor);
  const token = localStorage.getItem(TOKEN);

  useEffect(() => {
    scrollToBottom();
  }, [chat, messages, newMessage]);

  useEffect(() => {
    setPendingUploads([]);
    setIsEmojiPickerOpen(false);
    setTypingUsers([]);
  }, [chat?.id]);

  // Subscribe to typing events
  useEffect(() => {
    if (!stompClient || !isConnected || !chat?.id) {
      console.log('Typing subscription skipped:', { stompClient: !!stompClient, isConnected, chatId: chat?.id });
      return;
    }

    console.log('Subscribing to typing events for chat:', chat.id);
    console.log('Chat users structure:', chat.users);
    console.log('Current user ID:', reqUser?.id);

    const subscription = stompClient.subscribe(`/topic/typing/${chat.id}`, message => {
      try {
        const typingData = JSON.parse(message.body);
        console.log('Typing data received:', typingData);
        
        // Ignore own typing events - compare as strings
        const typingUserId = String(typingData.userId);
        const currentUserId = String(reqUser?.id);
        
        if (typingUserId === currentUserId) {
          console.log('Ignoring own typing event');
          return;
        }

        // Find the user who is typing from chat users
        const chatUsers = chat.users || chat.members || [];
        console.log('Chat users available:', chatUsers);
        let typingUser = chatUsers.find(user => String(user.id) === typingUserId);
        
        // If user not found in chat users, create a minimal user object
        if (!typingUser) {
          console.warn('Typing user NOT FOUND in chat.users! Creating fallback user object');
          console.log('Looking for userId:', typingUserId, 'in users:', chatUsers.map(u => ({ id: String(u.id), name: u.fullName })));
          // Create a fallback user object so typing indicator still shows
          typingUser = {
            id: typingUserId,
            fullName: 'User',
            profilePicture: null
          };
        }
        
        console.log('Typing user to use:', typingUser);
        
        if (typingData.isTyping) {
          // Add user to typing list if not already there
          setTypingUsers(prev => {
            const existingUser = prev.find(u => String(u.id) === typingUserId);
            if (!existingUser) {
              console.log('Adding typing user:', typingUser.fullName || typingUser.id);
              return [...prev, typingUser];
            }
            return prev;
          });
        } else {
          // Remove user from typing list
          setTypingUsers(prev => {
            const updated = prev.filter(u => String(u.id) !== typingUserId);
            if (updated.length !== prev.length) {
              console.log('Removing typing user:', typingUserId);
            }
            return updated;
          });
        }
      } catch (error) {
        console.error('Error processing typing event:', error);
      }
    });

    return () => {
      if (subscription) {
        console.log('Unsubscribing from typing events for chat:', chat.id);
        subscription.unsubscribe();
      }
    };
  }, [stompClient, isConnected, chat, reqUser]);

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onOpenMenu = event => {
    setAnchor(event.currentTarget);
  };

  const onCloseMenu = () => {
    setAnchor(null);
  };

  const onOpenAttachmentMenu = event => {
    setAttachmentAnchor(event.currentTarget);
  };

  const onCloseAttachmentMenu = () => {
    setAttachmentAnchor(null);
  };

  const onEditGroupChat = () => {
    onCloseMenu();
    setIsShowEditGroupChat(true);
  };

  const onDeleteChat = () => {
    onCloseMenu();
    if (token) {
      dispatch(deleteChat(chat.id, token));
      setCurrentChat(null);
    }
  };

  const onChangeNewMessage = event => {
    setIsEmojiPickerOpen(false);
    setNewMessage(event.target.value);
    
    // Send typing status via WebSocket
    if (stompClient && isConnected && chat?.id && reqUser?.id) {
      try {
        const typingData = {
          chatId: chat.id,
          userId: reqUser.id,
          isTyping: true
        };
        console.log('Sending typing start:', typingData);
        stompClient.publish({
          destination: '/app/typing',
          body: JSON.stringify(typingData)
        });
      } catch (error) {
        console.error('Error sending typing event:', error);
      }
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      if (stompClient && isConnected && chat?.id && reqUser?.id) {
        try {
          const typingData = {
            chatId: chat.id,
            userId: reqUser.id,
            isTyping: false
          };
          console.log('Sending typing stop:', typingData);
          stompClient.publish({
            destination: '/app/typing',
            body: JSON.stringify(typingData)
          });
        } catch (error) {
          console.error('Error sending typing stop event:', error);
        }
      }
    }, 2000);
  };

  const onFilesSelected = event => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setPendingUploads(prev => {
        const updated = [...prev, ...files];
        console.log('Attachments ready to send:', updated);
        return updated;
      });
    }
    event.target.value = '';
  };

  const onRemoveAttachment = fileName => {
    setPendingUploads(prev => prev.filter(file => file.name !== fileName));
  };

  const attachmentChips = useMemo(() => {
    if (pendingUploads.length === 0) {
      return null;
    }

    return (
      <div className={styles.pendingAttachmentContainer}>
        {pendingUploads.map(file => (
          <div className={styles.pendingAttachmentChip} key={`${file.name}-${file.lastModified}`}>
            <span>{file.name}</span>
            <IconButton size="small" onClick={() => onRemoveAttachment(file.name)}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </div>
        ))}
      </div>
    );
  }, [pendingUploads]);

  const onPickFiles = () => {
    onCloseAttachmentMenu();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onPickImages = () => {
    onCloseAttachmentMenu();
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const onChangeMessageQuery = event => {
    setMessageQuery(event.target.value.toLowerCase());
  };

  const onChangeSearch = () => {
    setIsSearch(!isSearch);
  };

  const onClearQuery = () => {
    setMessageQuery('');
    setIsSearch(false);
  };

  const getSearchEndAdornment = () => {
    return (
      <InputAdornment position="end">
        <IconButton onClick={onClearQuery}>
          <ClearIcon />
        </IconButton>
      </InputAdornment>
    );
  };

  const handleSendMessage = () => {
    // Clear typing indicator when sending message
    if (stompClient && isConnected && chat?.id && reqUser?.id) {
      const typingData = {
        chatId: chat.id,
        userId: reqUser.id,
        isTyping: false
      };
      stompClient.publish({
        destination: '/app/typing',
        body: JSON.stringify(typingData)
      });
    }
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    onSendMessage(pendingUploads);
    setPendingUploads([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    setIsEmojiPickerOpen(false);
  };

  const onKeyDown = event => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(prev => !prev);
  };

  const onCloseEmojiPicker = () => {
    setIsEmojiPickerOpen(false);
  };

  const onEmojiClick = emojiData => {
    if (!emojiData || !emojiData.emoji) {
      return;
    }
    setIsEmojiPickerOpen(false);
    setNewMessage(prev => `${prev || ''}${emojiData.emoji}`);
  };

  let lastDay = -1;
  let lastMonth = -1;
  let lastYear = -1;

  const getMessageCard = message => {
    const date = new Date(message.timeStamp);
    const isNewDate = lastDay !== date.getDate() || lastMonth !== date.getMonth() || lastYear !== date.getFullYear();

    if (isNewDate) {
      lastDay = date.getDate();
      lastMonth = date.getMonth();
      lastYear = date.getFullYear();
    }

    return (
      <MessageCard
        message={message}
        reqUser={reqUser}
        key={message.id}
        isNewDate={isNewDate}
        isGroup={chat.isGroup}
      />
    );
  };

  const filteredMessages =
    messageQuery.length > 0
      ? messages.filter(message => (message.content || '').toLowerCase().includes(messageQuery))
      : messages;

  return (
    <div className={styles.outerMessagePageContainer}>
      <div className={styles.messagePageHeaderContainer}>
        <div className={styles.messagePageInnerHeaderContainer}>
          <div className={styles.messagePageHeaderNameContainer}>
            {/* Sidebar Toggle Button */}
            <Tooltip 
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} 
              placement="bottom" 
              arrow
            >
              <IconButton onClick={onToggleSidebar} className={styles.headerIconButton}>
                <AnimatedArrowIcon size={20} isCollapsed={isSidebarCollapsed} />
              </IconButton>
            </Tooltip>
            
            <Avatar className={styles.chatAvatar}>
              {getInitialsFromName(getChatName(chat, reqUser))}
            </Avatar>
            <p>{getChatName(chat, reqUser)}</p>
          </div>
          <div className={styles.messagePageHeaderNameContainer}>
            {!isSearch && (
              <IconButton onClick={onChangeSearch} className={styles.headerIconButton}>
                <SearchIcon />
              </IconButton>
            )}
            {isSearch && (
              <TextField
                id="searchMessages"
                type="text"
                label="Search for messages ..."
                size="small"
                fullWidth
                value={messageQuery}
                onChange={onChangeMessageQuery}
                className={styles.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: getSearchEndAdornment()
                }}
                InputLabelProps={{
                  shrink: isFocused || messageQuery.length > 0,
                  style: { marginLeft: isFocused || messageQuery.length > 0 ? 0 : 30 }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            )}
            <IconButton onClick={onOpenMenu} className={styles.headerIconButton}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={anchor}
              open={open}
              onClose={onCloseMenu}
              MenuListProps={{ 'aria-labelledby': 'basic-button' }}
              PaperProps={{
                sx: {
                  background: '#262626',
                  color: '#fafafa',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(62, 62, 62, 0.5)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                }
              }}
            >
              {chat.isGroup && <MenuItem onClick={onEditGroupChat}>Edit Group Chat</MenuItem>}
              <MenuItem onClick={onDeleteChat}>
                {chat.isGroup ? 'Delete Group Chat' : 'Delete Chat'}
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>

      <div className={styles.messageContentContainer} onClick={onCloseEmojiPicker}>
        {filteredMessages.map(message => getMessageCard(message))}
        {typingUsers.length > 0 && console.log('Rendering typing indicators for:', typingUsers)}
        {typingUsers.map(user => (
          <TypingIndicator key={user.id} user={user} />
        ))}
        <div ref={lastMessageRef}></div>
      </div>

      <div className={styles.footerContainer}>
        {attachmentChips}
        <div className={styles.composer}>
          <IconButton
            onClick={onOpenAttachmentMenu}
            className={styles.attachButton}
            size="large"
          >
            <AddIcon />
          </IconButton>
          <div className={styles.inputWrapper}>
            <TextField
              id="newMessage"
              type="text"
              placeholder="Write a message..."
              variant="outlined"
              size="small"
              onKeyDown={onKeyDown}
              fullWidth
              value={newMessage}
              onChange={onChangeNewMessage}
              className={styles.messageInput}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleEmojiPicker} className={styles.emojiButton}>
                      <MoodIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </div>
          <IconButton onClick={handleSendMessage} className={styles.sendButton} size="large">
            <SendIcon />
          </IconButton>
        </div>

        <Menu
          anchorEl={attachmentAnchor}
          open={isAttachmentMenuOpen}
          onClose={onCloseAttachmentMenu}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            sx: {
              background: '#262626',
              color: '#fafafa',
              borderRadius: '0.75rem',
              border: '1px solid rgba(62, 62, 62, 0.5)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }
          }}
        >
          <MenuItem onClick={onPickFiles} className={styles.attachmentMenuItem}>
            <AttachFileIcon fontSize="small" />&nbsp;Upload file
          </MenuItem>
          <MenuItem onClick={onPickImages} className={styles.attachmentMenuItem}>
            <ImageIcon fontSize="small" />&nbsp;Upload photo
          </MenuItem>
        </Menu>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onFilesSelected}
          className={styles.hiddenInput}
          multiple
        />
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={onFilesSelected}
          className={styles.hiddenInput}
          multiple
        />

        {isEmojiPickerOpen && (
          <div className={styles.emojiOuterContainer}>
            <div className={styles.emojiContainer}>
              <EmojiPicker 
                onEmojiClick={onEmojiClick} 
                searchDisabled={true} 
                skinTonesDisabled={true}
                theme={isDarkMode ? "dark" : "light"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
