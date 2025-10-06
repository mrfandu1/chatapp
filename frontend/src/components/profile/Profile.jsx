import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TOKEN } from '../../config/Config';
import { currentUser, updateUser } from '../../redux/auth/AuthAction';
import WestIcon from '@mui/icons-material/West';
import { Avatar, Button, IconButton, TextField } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import CheckIcon from '@mui/icons-material/Check';
import styles from './Profile.module.scss';
import CloseIcon from '@mui/icons-material/Close';

const Profile = ({ onCloseProfile, initials, onLogout }) => {
  const [isEditName, setIsEditName] = useState(false);
  const [fullName, setFullName] = useState('');
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const token = localStorage.getItem(TOKEN);

  useEffect(() => {
    if (auth.reqUser?.fullName) {
      setFullName(auth.reqUser.fullName);
    } else {
      setFullName('');
    }
  }, [auth.reqUser]);

  useEffect(() => {
    if (token && auth.updateUser) {
      dispatch(currentUser(token));
    }
  }, [auth.updateUser, token, dispatch]);

  const onEditName = () => {
    setIsEditName(true);
  };

  const onUpdateUser = () => {
    if (fullName.trim() && token) {
      dispatch(updateUser({ fullName }, token));
      setIsEditName(false);
    }
  };

  const onCancelUpdate = () => {
    if (auth.reqUser?.fullName) {
      setFullName(auth.reqUser.fullName);
    }
    setIsEditName(false);
  };

  const onChangeFullName = event => {
    setFullName(event.target.value);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className={styles.outerContainer}>
      <div className={styles.headingContainer}>
        <IconButton onClick={onCloseProfile}>
          <WestIcon fontSize="medium" />
        </IconButton>
        <h2>Profile</h2>
      </div>
      <div className={styles.avatarContainer}>
        <Avatar className={styles.avatar}>{initials}</Avatar>
      </div>
      <div className={styles.nameContainer}>
        {!isEditName && (
          <div className={styles.innerNameStaticContainer}>
            <p className={styles.nameDistance}>{auth.reqUser?.fullName}</p>
            <IconButton onClick={onEditName}>
              <CreateIcon />
            </IconButton>
          </div>
        )}
        {isEditName && (
          <div className={styles.innerNameDynamicContainer}>
            <TextField
              id="fullName"
              type="text"
              label="Enter your full name"
              variant="outlined"
              onChange={onChangeFullName}
              value={fullName}
            />
            <div className={styles.actionButtons}>
              <IconButton onClick={onCancelUpdate}>
                <CloseIcon />
              </IconButton>
              <IconButton onClick={onUpdateUser}>
                <CheckIcon />
              </IconButton>
            </div>
          </div>
        )}
      </div>
      <div className={styles.infoContainer}>
        <p className={styles.infoText}>This name will appear on your messages</p>
      </div>
      <div className={styles.logoutContainer}>
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          fullWidth
          className={styles.logoutButton}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;
