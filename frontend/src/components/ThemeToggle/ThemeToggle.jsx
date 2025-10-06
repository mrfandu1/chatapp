import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeToggle.module.scss';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <label htmlFor="switch" className={styles.switch}>
      <input 
        id="switch" 
        type="checkbox" 
        checked={!isDarkMode} 
        onChange={toggleTheme}
      />
      <span className={styles.slider}></span>
      <span className={styles.decoration}></span>
    </label>
  );
};

export default ThemeToggle;
