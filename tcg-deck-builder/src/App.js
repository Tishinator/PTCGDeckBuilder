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
  
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  useEffect(() => {
    if (isMobileDevice()) {
        alert('PTCG Deck builder is still in mobile development. Please view on a desktop for full functionality.');
        // You can also set state here to conditionally render mobile-specific components or layouts
    }
  }, []);


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
