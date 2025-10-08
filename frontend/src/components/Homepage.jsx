import styles from './Homepage.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Divider, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Client } from '@stomp/stompjs';

import { TOKEN, WS_ENDPOINT, BASE_API_URL } from '../config/Config';
import EditGroupChat from './editChat/EditGroupChat';
import Profile from './profile/Profile';
import { currentUser, logoutUser } from '../redux/auth/AuthAction';
import { getUserChats, markChatAsRead } from '../redux/chat/ChatAction';
import ChatCard from './chatCard/ChatCard';
import { getInitialsFromName } from './utils/Utils';
import WelcomePage from './welcomePage/WelcomePage';
import MessagePage from './messagePage/MessagePage';
import { createMessage, getAllMessages } from '../redux/message/MessageAction';
import { AUTHORIZATION_PREFIX } from '../redux/Constants';
import CreateGroupChat from './editChat/CreateGroupChat';
import CreateSingleChat from './editChat/CreateSingleChat';

const Homepage = () => {
  const authState = useSelector(state => state.auth);
  const chatState = useSelector(state => state.chat);
  const messageState = useSelector(state => state.message);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem(TOKEN);

  const [isShowEditGroupChat, setIsShowEditGroupChat] = useState(false);
  const [isShowCreateGroupChat, setIsShowCreateGroupChat] = useState(false);
  const [isShowCreateSingleChat, setIsShowCreateSingleChat] = useState(false);
  const [isShowProfile, setIsShowProfile] = useState(false);
  const [initials, setInitials] = useState('');
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageReceived, setMessageReceived] = useState(false);
  const [subscribeTry, setSubscribeTry] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (token && !authState.reqUser) {
      dispatch(currentUser(token));
    }
  }, [token, dispatch, authState.reqUser]);

  useEffect(() => {
    if (!token || authState.reqUser === null) {
      navigate('/signin');
    }
  }, [token, navigate, authState.reqUser]);

  useEffect(() => {
    if (authState.reqUser && authState.reqUser.fullName) {
      const letters = getInitialsFromName(authState.reqUser.fullName);
      setInitials(letters);
    }
  }, [authState.reqUser?.fullName]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const shouldCollapse = window.innerWidth < 900;
      setIsSidebarCollapsed(prev => (shouldCollapse ? true : prev));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(getUserChats(token));
    }
  }, [chatState.createdChat, chatState.createdGroup, dispatch, token, messageState.newMessage, chatState.deletedChat, chatState.editedGroup, chatState.markedAsReadChat]);

  useEffect(() => {
    setCurrentChat(chatState.editedGroup);
  }, [chatState.editedGroup]);

  useEffect(() => {
    if (currentChat?.id && token) {
      dispatch(getAllMessages(currentChat.id, token));
    }
  }, [currentChat, dispatch, token, messageState.newMessage, messageReceived]);

  useEffect(() => {
    setMessages(messageState.messages);
  }, [messageState.messages]);

  useEffect(() => {
    if (messageState.newMessage && stompClient && currentChat && isConnected) {
      const webSocketMessage = { ...messageState.newMessage, chat: currentChat };
      stompClient.publish({
        destination: '/app/messages',
        body: JSON.stringify(webSocketMessage)
      });
    }
  }, [messageState.newMessage, stompClient, currentChat, isConnected]);

  useEffect(() => {
    if (isConnected && stompClient && stompClient.active && authState.reqUser) {
      const subscription = stompClient.subscribe(`/topic/${authState.reqUser.id}`, onMessageReceive);
      return () => subscription.unsubscribe();
    }

    const timeout = setTimeout(() => setSubscribeTry(prev => prev + 1), 500);
    return () => clearTimeout(timeout);
  }, [subscribeTry, isConnected, stompClient, authState.reqUser]);

  useEffect(() => {
    if (messageReceived && currentChat?.id && token) {
      dispatch(markChatAsRead(currentChat.id, token));
      dispatch(getAllMessages(currentChat.id, token));
    }

    if (token) {
      dispatch(getUserChats(token));
    }

    setMessageReceived(false);
  }, [messageReceived, currentChat, token, dispatch]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const headers = {
      Authorization: `${AUTHORIZATION_PREFIX}${token}`
    };

    const client = new Client({
      brokerURL: WS_ENDPOINT,
      connectHeaders: headers,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log('WebSocket connected successfully');
        setTimeout(() => setIsConnected(true), 1000);
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
        setIsConnected(false);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket connection error', error);
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      },
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('STOMP debug:', str);
        }
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client.active) {
        client.deactivate();
      }
      setIsConnected(false);
    };
  }, [token]);

  const onMessageReceive = (payload) => {
    console.log('Message received via WebSocket:', payload);
    setMessageReceived(true);
  };

  const onSendMessage = attachments => {
    if (!currentChat?.id || !token) {
      return;
    }

    const trimmedMessage = newMessage?.trim() || '';
    const hasText = trimmedMessage.length > 0;
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

    if (!hasText && !hasAttachments) {
      return;
    }

    const formData = new FormData();
    formData.append('chatId', currentChat.id);

    if (hasText) {
      formData.append('content', trimmedMessage);
    }

    if (hasAttachments) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    dispatch(createMessage(formData, token));
    setNewMessage('');
  };

  const onOpenProfile = () => {
    setIsShowProfile(true);
  };

  const onCloseProfile = () => {
    setIsShowProfile(false);
  };

  const onCreateGroupChat = () => {
    setIsShowCreateGroupChat(true);
  };

  const onCreateSingleChat = () => {
    setIsShowCreateSingleChat(true);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const openSidebar = () => {
    setIsSidebarCollapsed(false);
  };

  const onLogout = () => {
    dispatch(logoutUser());
    navigate('/signin');
  };

  const onChangeQuery = event => {
    setQuery(event.target.value.toLowerCase());
  };

  const onClearQuery = () => {
    setQuery('');
  };

  const onClickChat = chat => {
    if (token) {
      dispatch(markChatAsRead(chat.id, token));
    }
    setCurrentChat(chat);
  };

  const getSearchEndAdornment = () => (
    query.length > 0 && (
      <InputAdornment position="end">
        <IconButton onClick={onClearQuery}>
          <ClearIcon />
        </IconButton>
      </InputAdornment>
    )
  );

  const chatsToRender = useMemo(() => {
    if (!chatState.chats) {
      return [];
    }
    const normalizedQuery = query.trim().toLowerCase();
    return chatState.chats.filter(chat => {
      if (!normalizedQuery) {
        return true;
      }

      if (chat.isGroup) {
        return chat.chatName.toLowerCase().includes(normalizedQuery);
      }

      const [first, second] = chat.users;
      const otherUser = first.id === authState.reqUser?.id ? second : first;
      return otherUser.fullName.toLowerCase().includes(normalizedQuery);
    });
  }, [authState.reqUser?.id, chatState.chats, query]);

  const isOverlayVisible =
    isShowCreateSingleChat || isShowCreateGroupChat || isShowEditGroupChat || isShowProfile;

  const handleSelectChat = chat => {
    if (token) {
      dispatch(markChatAsRead(chat.id, token));
    }
    setCurrentChat(chat);
  };



  return (
    <div className={styles.appShell}>
      <aside className={`${styles.sideBarContainer} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
        {isShowCreateSingleChat && (
          <CreateSingleChat setIsShowCreateSingleChat={setIsShowCreateSingleChat} />
        )}
        {isShowCreateGroupChat && (
          <CreateGroupChat setIsShowCreateGroupChat={setIsShowCreateGroupChat} />
        )}
        {isShowEditGroupChat && (
          <EditGroupChat
            setIsShowEditGroupChat={setIsShowEditGroupChat}
            currentChat={currentChat}
          />
        )}
        {isShowProfile && (
          <div className={styles.profileContainer}>
            <Profile onCloseProfile={onCloseProfile} initials={initials} onLogout={onLogout} />
          </div>
        )}

        {!isOverlayVisible && (
          <div className={styles.sideBarInnerContainer}>
            <div className={`${styles.navContainer} ${isSidebarCollapsed ? styles.navCollapsed : ''}`}>
              {!isSidebarCollapsed && <h2 className={styles.sidebarTitle}>Chats</h2>}
              <div className={styles.actionsGroup}>
                <Tooltip
                  title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  placement="bottom"
                  arrow
                >
                  <IconButton onClick={toggleSidebar} className={styles.actionButton} size="large">
                    {isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                  </IconButton>
                </Tooltip>
                {!isSidebarCollapsed && (
                  <>
                    <Tooltip title="New chat" placement="bottom" arrow>
                      <IconButton
                        onClick={onCreateSingleChat}
                        className={styles.actionButton}
                        size="large"
                      >
                        <ChatIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Create group" placement="bottom" arrow>
                      <IconButton
                        onClick={onCreateGroupChat}
                        className={styles.actionButton}
                        size="large"
                      >
                        <GroupAddIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>

            <div className={`${styles.searchContainer} ${isSidebarCollapsed ? styles.searchCollapsed : ''}`}>
              {!isSidebarCollapsed ? (
                <TextField
                  id="search"
                  type="text"
                  label="Search your chats ..."
                  size="small"
                  fullWidth
                  value={query}
                  className={styles.searchField}
                  onChange={onChangeQuery}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: getSearchEndAdornment()
                  }}
                  InputLabelProps={{
                    shrink: focused || query.length > 0,
                    style: { marginLeft: focused || query.length > 0 ? 0 : 30 }
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              ) : (
                <Tooltip title="Expand to search" placement="right" arrow>
                  <IconButton onClick={openSidebar} className={styles.searchIconButton}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              )}
            </div>

            <div className={`${styles.chatsContainer} ${isSidebarCollapsed ? styles.chatsCollapsed : ''}`}>
              {chatsToRender.map((chat, index) => (
                <div key={chat.id} onClick={() => handleSelectChat(chat)} className={styles.chatRow}>
                  {!isSidebarCollapsed && index !== 0 && <Divider className={styles.listDivider} />}
                  <ChatCard chat={chat} isCompact={isSidebarCollapsed} />
                </div>
              ))}
            </div>

            <div className={styles.sidebarFooter}>
              <div
                onClick={onOpenProfile}
                className={`${styles.profileSummary} ${isSidebarCollapsed ? styles.profileSummaryCollapsed : ''}`}
              >
                <Avatar
                  sx={{
                    width: '2.75rem',
                    height: '2.75rem',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                  }}
                >
                  {initials}
                </Avatar>
                {!isSidebarCollapsed && (
                  <div className={styles.profileText}>
                    <p className={styles.profileName}>{authState.reqUser?.fullName}</p>
                    <span className={styles.profileHint}>View profile & logout</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      <section className={styles.messagesContainer}>
        {!currentChat && <WelcomePage reqUser={authState.reqUser} />}
        {currentChat && (
          <MessagePage
            chat={currentChat}
            reqUser={authState.reqUser}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={onSendMessage}
            setIsShowEditGroupChat={setIsShowEditGroupChat}
            setCurrentChat={setCurrentChat}
            stompClient={stompClient}
            isConnected={isConnected}
          />
        )}
      </section>
    </div>
  );
};

export default Homepage;
