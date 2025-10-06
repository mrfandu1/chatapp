import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TOKEN } from '../../config/Config';
import { searchUser } from '../../redux/auth/AuthAction';
import {
  Avatar,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import WestIcon from '@mui/icons-material/West';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { createGroupChat } from '../../redux/chat/ChatAction';
import styles from './CreateGroupChat.module.scss';
import { getInitialsFromName } from '../utils/Utils';

const CreateGroupChat = ({ setIsShowCreateGroupChat }) => {
  const authState = useSelector(state => state.auth);
  const [groupMember, setGroupMember] = useState(new Set());
  const [userQuery, setUserQuery] = useState('');
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const token = localStorage.getItem(TOKEN);

  useEffect(() => {
    setName('New Group Chat');
  }, []);

  useEffect(() => {
    if (token && userQuery.length > 0) {
      dispatch(searchUser(userQuery, token));
    }
  }, [userQuery, token, dispatch]);

  useEffect(() => {
    if (authState.reqUser) {
      setGroupMember(prev => {
        const updated = new Set(prev);
        updated.add(authState.reqUser);
        return updated;
      });
    }
  }, [authState.reqUser]);

  const members = useMemo(() => Array.from(groupMember), [groupMember]);

  const onCreate = () => {
    if (!token) {
      return;
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return;
    }

    const userIds = members.map(member => member.id);
    if (userIds.length <= 1) {
      return;
    }

    dispatch(createGroupChat({ chatName: trimmedName, userIds }, token));
    setIsShowCreateGroupChat(false);
  };

  const onRemoveMember = member => {
    setGroupMember(prev => {
      const updatedMembers = new Set(prev);
      updatedMembers.delete(member);
      return updatedMembers;
    });
  };

  const onAddMember = member => {
    setGroupMember(prev => {
      const updatedMembers = new Set(prev);
      updatedMembers.add(member);
      return updatedMembers;
    });
  };

  const handleBack = () => {
    setIsShowCreateGroupChat(false);
  };

  const onChangeQuery = event => {
    setUserQuery(event.target.value);
  };

  const onChangeName = event => {
    setName(event.target.value);
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

  const filteredUsers = useMemo(() => {
    const existingIds = new Set(members.map(member => member.id));
    return (authState.searchUser || []).filter(user => !existingIds.has(user.id));
  }, [authState.searchUser, members]);

  const canCreate = name.trim().length > 0 && members.length > 1;

  const renderMemberRow = (member, actionButton) => {
    const initials = getInitialsFromName(member.fullName);
    return (
      <div className={styles.memberRow} key={member.id}>
        <div className={styles.memberInfo}>
          <Avatar className={styles.memberAvatar}>{initials}</Avatar>
          <div>
            <p className={styles.memberName}>{member.fullName}</p>
            <span className={styles.memberEmail}>{member.email}</span>
          </div>
        </div>
        {actionButton}
      </div>
    );
  };

  const renderRemoveButton = member => {
    if (member.id === authState.reqUser?.id) {
      return (
        <Tooltip title="You" placement="left" arrow>
          <IconButton disabled className={styles.memberActionButton}>
            <RemoveIcon />
          </IconButton>
        </Tooltip>
      );
    }

    return (
      <Tooltip title="Remove from group" placement="left" arrow>
        <IconButton
          onClick={() => onRemoveMember(member)}
          className={styles.memberActionButton}
        >
          <RemoveIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const renderAddButton = member => (
    <Tooltip title="Add to group" placement="left" arrow>
      <IconButton onClick={() => onAddMember(member)} className={styles.memberActionButton}>
        <AddIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <div className={styles.createGroupChatOuterContainer}>
      <div className={styles.createGroupChatCard}>
        <div className={styles.cardHeader}>
          <IconButton onClick={handleBack} className={styles.backButton}>
            <WestIcon />
          </IconButton>
          <div className={styles.headerText}>
            <h2>Create group</h2>
            <p>Hand-pick the people for this new conversation.</p>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.inputBlock}>
            <label htmlFor="groupName">Group name</label>
            <TextField
              id="groupName"
              type="text"
              placeholder="Give your chat a vibe"
              value={name}
              onChange={onChangeName}
              fullWidth
              InputProps={{ className: styles.darkInput }}
            />
          </div>

          <div className={styles.inputBlock}>
            <label htmlFor="searchUser">Add members</label>
            <TextField
              id="searchUser"
              type="text"
              placeholder="Search teammates by name or email"
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

          <div className={styles.membersSection}>
            <div className={styles.sectionHeading}>
              <h3>Members</h3>
              <span>{members.length} total</span>
            </div>
            <div className={styles.memberList}>
              {members.map(member => renderMemberRow(member, renderRemoveButton(member)))}
            </div>
          </div>

          <div className={styles.membersSection}>
            <div className={styles.sectionHeading}>
              <h3>Suggested</h3>
              <span>{filteredUsers.length} results</span>
            </div>
            <div className={styles.memberList}>
              {userQuery.length > 0 && filteredUsers.length === 0 && (
                <p className={styles.emptyState}>No people found. Try another search.</p>
              )}
              {filteredUsers.map(user => renderMemberRow(user, renderAddButton(user)))}
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <Button
            variant="contained"
            disableElevation
            onClick={onCreate}
            disabled={!canCreate}
            className={styles.createButton}
          >
            Create group chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupChat;
