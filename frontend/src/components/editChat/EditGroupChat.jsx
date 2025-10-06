import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TOKEN } from '../../config/Config';
import { searchUser } from '../../redux/auth/AuthAction';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import WestIcon from '@mui/icons-material/West';
import styles from './EditGroupChat.module.scss';
import GroupMember from './GroupMember';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { addUserToGroupChat, removeUserFromGroupChat } from '../../redux/chat/ChatAction';

const EditGroupChat = ({ setIsShowEditGroupChat, currentChat }) => {
  const authState = useSelector(state => state.auth);
  const [userQuery, setUserQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const dispatch = useDispatch();
  const token = localStorage.getItem(TOKEN);

  useEffect(() => {
    if (token && userQuery.length > 0) {
      dispatch(searchUser(userQuery, token));
    }
  }, [userQuery, token, dispatch]);

  const onRemoveMember = user => {
    if (token && currentChat) {
      dispatch(removeUserFromGroupChat(currentChat.id, user.id, token));
    }
  };

  const onAddMember = user => {
    if (token && currentChat) {
      dispatch(addUserToGroupChat(currentChat.id, user.id, token));
    }
  };

  const handleBack = () => {
    setIsShowEditGroupChat(false);
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
          <IconButton onClick={onClearQuery}>
            <ClearIcon />
          </IconButton>
        </InputAdornment>
      )
    );
  };

  return (
    <div className={styles.outerEditGroupChatContainer}>
      <div className={styles.editGroupChatNavContainer}>
        <IconButton onClick={handleBack}>
          <WestIcon fontSize="medium" />
        </IconButton>
        <h2>Edit Group Chat</h2>
      </div>
      <div>
        <div className={styles.editGroupChatTextContainer}>
          <p className={styles.editGroupChatText}>Remove user</p>
        </div>
        <div className={styles.editGroupChatUserContainer}>
          {currentChat?.users.map(user => (
            <GroupMember member={user} onRemoveMember={onRemoveMember} key={user.id} />
          ))}
        </div>
        <div className={styles.editGroupChatTextContainer}>
          <p className={styles.editGroupChatText}>Add user</p>
        </div>
        <div className={styles.editGroupChatTextField}>
          <TextField
            id="searchUser"
            type="text"
            label="Search user ..."
            size="small"
            fullWidth
            value={userQuery}
            onChange={onChangeQuery}
            sx={{ backgroundColor: 'white' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: getSearchEndAdornment()
            }}
            InputLabelProps={{
              shrink: focused || userQuery.length > 0,
              style: { marginLeft: focused || userQuery.length > 0 ? 0 : 30 }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      </div>
      <div className={styles.editGroupChatUserContainer}>
        {userQuery.length > 0 &&
          authState.searchUser
            ?.filter(user => !currentChat?.users.find(existingUser => existingUser.id === user.id))
            .map(user => <GroupMember member={user} onAddMember={onAddMember} key={user.id} />)}
      </div>
    </div>
  );
};

export default EditGroupChat;
