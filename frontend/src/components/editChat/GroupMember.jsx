import { Avatar, IconButton } from '@mui/material';
import React from 'react';
import { getInitialsFromName } from '../utils/Utils';
import styles from './GroupMember.module.scss';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const GroupMember = ({ member, onRemoveMember, onAddMember }) => {
  const initials = getInitialsFromName(member.fullName);

  const onRemove = () => {
    if (onRemoveMember) {
      onRemoveMember(member);
    }
  };

  const onAdd = () => {
    if (onAddMember) {
      onAddMember(member);
    }
  };

  return (
    <div className={styles.groupMemberOuterContainer}>
      <div className={styles.groupMemberAvatarContainer}>
        <Avatar
          sx={{
            width: '2.5rem',
            height: '2.5rem',
            fontSize: '1rem',
            mr: '0.75rem'
          }}
        >
          {initials}
        </Avatar>
        <p>{member.fullName}</p>
      </div>
      {onAddMember && (
        <IconButton onClick={onAdd}>
          <AddIcon />
        </IconButton>
      )}
      {onRemoveMember && (
        <IconButton onClick={onRemove}>
          <RemoveIcon />
        </IconButton>
      )}
    </div>
  );
};

export default GroupMember;
