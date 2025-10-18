import React, { useMemo } from 'react';
import { Avatar, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ClearIcon from '@mui/icons-material/Clear';
import { SearchIcon, PlusIcon, AnimatedArrowIcon } from '../../assets/sidebarVercelIcons';
import ChatCard from '../chatCard/ChatCard';
import styles from './VercelSidebar.module.scss';

const VercelSidebar = ({
  authState,
  chatState,
  initials,
  query,
  setQuery,
  onCreateGroupChat,
  onCreateSingleChat,
  onOpenProfile,
  handleSelectChat,
  isCollapsed,
  isHoverOpen,
  onSidebarHoverEnter,
  onSidebarHoverLeave,
  isChatOpen
}) => {
  const [focused, setFocused] = React.useState(false);

  const onChangeQuery = (event) => {
    setQuery(event.target.value.toLowerCase());
  };

  const onClearQuery = () => {
    setQuery('');
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

  return (
    <div className={`${styles.sidebarContainer} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Hover-Reveal Panel */}
      <div 
        className={`${styles.sidebarWrapper} sidebar-wrapper ${isCollapsed ? styles.wrapperCollapsed : ''} ${isHoverOpen ? styles.hoverOpen : ''}`}
        onMouseEnter={onSidebarHoverEnter}
        onMouseLeave={onSidebarHoverLeave}
      >
        <div className={styles.sidebarInner}>
          {/* New Chat Button */}
          <button className={styles.newChatButton} onClick={onCreateSingleChat}>
            <PlusIcon size={16} className={styles.buttonIcon} />
            New Chat
          </button>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <TextField
              id="search"
              type="text"
              placeholder="Search..."
              size="small"
              fullWidth
              value={query}
              className={styles.searchField}
              onChange={onChangeQuery}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={14} className={styles.searchIconSmall} />
                  </InputAdornment>
                ),
                endAdornment: getSearchEndAdornment()
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>

          {/* Navigation Menu */}
          <nav className={styles.navMenu}>
            {/* Recent Section */}
            <div className={styles.sectionHeader}>
              <span>Recent Chats</span>
            </div>

            {/* Chat History Items */}
            <div className={styles.chatsList}>
              {chatsToRender.map((chat, index) => (
                <div 
                  key={chat.id} 
                  onClick={() => handleSelectChat(chat)} 
                  className={styles.chatItem}
                >
                  <ChatCard chat={chat} isCompact={false} />
                </div>
              ))}
              
              {chatsToRender.length === 0 && (
                <div className={styles.emptyState}>
                  <p>No chats found</p>
                </div>
              )}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className={styles.bottomActions}>
            <Tooltip title="Create group" placement="right" arrow>
              <button className={styles.actionButton} onClick={onCreateGroupChat}>
                <GroupAddIcon fontSize="small" />
                <span>Create Group</span>
              </button>
            </Tooltip>
            
            <div className={styles.profileSummary} onClick={onOpenProfile}>
              <Avatar
                sx={{
                  width: '2rem',
                  height: '2rem',
                  fontSize: '0.875rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                }}
              >
                {initials}
              </Avatar>
              <div className={styles.profileText}>
                <span className={styles.profileName}>{authState.reqUser?.fullName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VercelSidebar;
