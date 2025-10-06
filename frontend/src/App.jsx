import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Homepage from './components/Homepage';
import SignIn from './components/register/SignIn';
import SignUp from './components/register/SignUp';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import './App.css';

function App() {
  return (
    <div>
      <div className="theme-toggle-container">
        <ThemeToggle />
      </div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
  );
}

export default App;
