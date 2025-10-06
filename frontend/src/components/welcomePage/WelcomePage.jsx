import ForumIcon from '@mui/icons-material/Forum';
import React from 'react';
import styles from './WelcomePage.module.scss';

const WelcomePage = ({ reqUser }) => {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.innerWelcomeContainer}>
        <ForumIcon
          sx={{
            width: '10rem',
            height: '10rem',
            color: '#6366f1',
            mb: '1rem'
          }}
        />
        <h1>Welcome, {reqUser?.fullName}!</h1>
        <p>Chat App designed and developed by Team.</p>
      </div>
    </div>
  );
};

export default WelcomePage;
