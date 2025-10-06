import styles from './CreateSingleChat.module.scss';
import {
  Avatar,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip
} from '@mui/material';
import WestIcon from '@mui/icons-material/West';
import React, { useEffect, useMemo, useState } from 'react';
import { createChat } from '../../redux/chat/ChatAction';
import { TOKEN } from '../../config/Config';
import { useDispatch, useSelector } from 'react-redux';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { searchUser } from '../../redux/auth/AuthAction';
import CheckIcon from '@mui/icons-material/Check';
import { getInitialsFromName } from '../utils/Utils';

const CreateSingleChat = ({ setIsShowCreateSingleChat }) => {
  const authState = useSelector(state => state.auth);
  const token = localStorage.getItem(TOKEN);
  const dispatch = useDispatch();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userQuery, setUserQuery] = useState('');

  useEffect(() => {
    if (token && userQuery.length > 0) {
      dispatch(searchUser(userQuery, token));
    }
  }, [userQuery, token, dispatch]);

  const onHandleBack = () => {
    setIsShowCreateSingleChat(false);
  };

  const onCreate = () => {
    if (token && selectedUser) {
      dispatch(createChat(selectedUser.id, token));
      setIsShowCreateSingleChat(false);
    }
  };

  const onChangeQuery = event => {
    setUserQuery(event.target.value);
  };

  const onClearQuery = () => {
    setUserQuery('');
  };

  const getSearchEndAdornment = () => {
    return (
      userQuery.length > 0 && (
        <InputAdornment position="end">
          <IconButton onClick={onClearQuery} size="small">
            <ClearIcon fontSize="small" />
          </IconButton>
        </InputAdornment>
      )
    );
  };

  const results = useMemo(() => authState.searchUser || [], [authState.searchUser]);

  const renderSelected = () => {
    if (!selectedUser) {
      return <p className={styles.emptyState}>No one selected yet.</p>;
    }

    const initials = getInitialsFromName(selectedUser.fullName);
    return (
      <div className={`${styles.resultRow} ${styles.selectedRow}`}>
        <div className={styles.resultInfo}>
          <Avatar className={styles.resultAvatar}>{initials}</Avatar>
          <div>
            <p className={styles.resultName}>{selectedUser.fullName}</p>
            <span className={styles.resultEmail}>{selectedUser.email}</span>
          </div>
        </div>
        <Tooltip title="Selected" arrow>
          <div className={styles.statusBadge}>
            <CheckIcon fontSize="small" />
          </div>
        </Tooltip>
      </div>
    );
  };

  const renderResultRow = user => {
    const initials = getInitialsFromName(user.fullName);
    const isActive = selectedUser?.id === user.id;
    return (
      <button
        type="button"
        key={user.id}
        onClick={() => setSelectedUser(user)}
        className={`${styles.resultRow} ${isActive ? styles.activeRow : ''}`}
      >
        <div className={styles.resultInfo}>
          <Avatar className={styles.resultAvatar}>{initials}</Avatar>
          <div>
            <p className={styles.resultName}>{user.fullName}</p>
            <span className={styles.resultEmail}>{user.email}</span>
          </div>
        </div>
        {isActive && <CheckIcon fontSize="small" />}
      </button>
    );
  };

  return (
    <div className={styles.createSingleChatOuterContainer}>
      <div className={styles.createSingleChatCard}>
        <div className={styles.cardHeader}>
          <IconButton onClick={onHandleBack} className={styles.backButton}>
            <WestIcon />
          </IconButton>
          <div className={styles.headerText}>
            <h2>Start a chat</h2>
            <p>Search for someone to begin a direct conversation.</p>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.inputBlock}>
            <label htmlFor="searchUser">Search people</label>
            <TextField
              id="searchUser"
              type="text"
              placeholder="Find teammates by name or email"
              value={userQuery}
              onChange={onChangeQuery}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: getSearchEndAdornment(),
                className: styles.darkInput
              }}
            />
          </div>

          <div className={styles.selectedSection}>
            <h3>Selected</h3>
            {renderSelected()}
          </div>

          <div className={styles.resultsSection}>
            <div className={styles.sectionHeading}>
              <h3>Suggestions</h3>
              <span>{results.length} matches</span>
            </div>
            <div className={styles.resultList}>
              {userQuery.length > 0 && results.length === 0 && (
                <p className={styles.emptyState}>No matches found. Try adjusting your search.</p>
              )}
              {results.map(renderResultRow)}
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <Button
            variant="contained"
            disableElevation
            onClick={onCreate}
            disabled={!selectedUser}
            className={styles.createButton}
          >
            Create chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSingleChat;
