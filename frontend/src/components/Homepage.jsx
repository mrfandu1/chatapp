import styles from './Homepage.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from '@mui/material';
import { Client } from '@stomp/stompjs';

import { TOKEN, WS_ENDPOINT, BASE_API_URL } from '../config/Config';
import EditGroupChat from './editChat/EditGroupChat';
import Profile from './profile/Profile';
import { currentUser, logoutUser } from '../redux/auth/AuthAction';
import { getUserChats, markChatAsRead } from '../redux/chat/ChatAction';
import { getInitialsFromName } from './utils/Utils';
import WelcomePage from './welcomePage/WelcomePage';
import MessagePage from './messagePage/MessagePage';
import { createMessage, getAllMessages } from '../redux/message/MessageAction';
import { AUTHORIZATION_PREFIX } from '../redux/Constants';
import CreateGroupChat from './editChat/CreateGroupChat';
import CreateSingleChat from './editChat/CreateSingleChat';
import VercelSidebar from './sidebar/VercelSidebar';
import { AnimatedArrowIcon } from '../assets/sidebarVercelIcons';

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
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageReceived, setMessageReceived] = useState(false);
  const [subscribeTry, setSubscribeTry] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHoverOpen, setIsSidebarHoverOpen] = useState(false);

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
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleToggleHoverEnter = () => {
    if (isSidebarCollapsed) {
      setIsSidebarHoverOpen(true);
    }
  };

  const handleToggleHoverLeave = () => {
    setIsSidebarHoverOpen(false);
  };

  const handleSidebarHoverEnter = () => {
    if (isSidebarCollapsed) {
      setIsSidebarHoverOpen(true);
    }
  };

  const handleSidebarHoverLeave = () => {
    setIsSidebarHoverOpen(false);
  };

  const onLogout = () => {
    dispatch(logoutUser());
    navigate('/signin');
  };

  const onClickChat = chat => {
    if (token) {
      dispatch(markChatAsRead(chat.id, token));
    }
    setCurrentChat(chat);
  };

  const handleSelectChat = chat => {
    if (token) {
      dispatch(markChatAsRead(chat.id, token));
    }
    setCurrentChat(chat);
  };

  const isOverlayVisible =
    isShowCreateSingleChat || isShowCreateGroupChat || isShowEditGroupChat || isShowProfile;


  return (
    <div className={styles.appShell}>
      {/* Group wrapper for sidebar hover effect */}
      <div className={`${styles.contentGroup} group`}>
        <aside className={styles.sideBarWrapper}>
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
            <VercelSidebar
              authState={authState}
              chatState={chatState}
              initials={initials}
              query={query}
              setQuery={setQuery}
              onCreateGroupChat={onCreateGroupChat}
              onCreateSingleChat={onCreateSingleChat}
              onOpenProfile={onOpenProfile}
              handleSelectChat={handleSelectChat}
              isCollapsed={isSidebarCollapsed}
              isHoverOpen={isSidebarHoverOpen}
              onSidebarHoverEnter={handleSidebarHoverEnter}
              onSidebarHoverLeave={handleSidebarHoverLeave}
              isChatOpen={!!currentChat}
            />
          )}
        </aside>

        {/* Main Content Area with Toggle Button */}
        <section className={styles.messagesContainer}>
          {/* Toggle button trigger - this is the hover target */}
          {/* Only show when no chat is selected */}
          {!currentChat && (
            <div 
              className={`${styles.toggleTrigger} sidebar-icon-trigger`}
              onMouseEnter={handleToggleHoverEnter}
              onMouseLeave={handleToggleHoverLeave}
            >
              <Tooltip 
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} 
                placement="right" 
                arrow
              >
                <button className={styles.toggleButton} onClick={toggleSidebar}>
                  <AnimatedArrowIcon size={20} isCollapsed={isSidebarCollapsed} />
                </button>
              </Tooltip>
            </div>
          )}

          {/* Message content */}
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
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default Homepage;
