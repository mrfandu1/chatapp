import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/Store';
import { ThemeProvider } from './context/ThemeContext';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <Provider store={store}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </Provider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
