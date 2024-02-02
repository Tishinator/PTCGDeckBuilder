import React, { useEffect, useState, useContext,  } from 'react';
import './App.css';
import './DarkMode.css';
import './LightMode.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import { AppThemeContext, ThemeProvider } from './context/AppThemeContext';
import Header from './components/layout/Header';
import CardSearchPanel from './components/layout/CardSearchPanel';
import DeckViewPanel from './components/layout/DeckViewPanel';
import { DoubleClickProvider } from './context/DoubleClickContext';

function App() {
  const {theme} = useContext(AppThemeContext);

  return (
    <div className={`App ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <Header />
      <div className='content'>
        <CardSearchPanel />
        <DeckViewPanel />
      </div>
    </div>
  );
}

// Wrap the App component with ThemeProvider
export default function AppWrapper() {
  return (
    <ThemeProvider>
      <DoubleClickProvider>
        <App />
      </DoubleClickProvider>
    </ThemeProvider>
  );
}
