import React, { useEffect, useState, useContext,  } from 'react';
import './App.css';
import './DarkMode.css';
import './LightMode.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import { AppThemeContext, ThemeProvider } from './context/AppThemeContext';
import Header from './components/layout/Header';
import CardSearchPanel from './components/layout/CardSearchPanel';
import DeckViewPanel from './components/layout/DeckViewPanel';

function App() {
  const {theme} = useContext(AppThemeContext);
  const [doubleClickedData, setDoubleClickedData] = useState(null);
  const [doubleClickTrigger, setDoubleClickTrigger] = useState(0);
  

  const handleDoubleClickData = (data) => {
      if (data) {
          setDoubleClickedData(data);
          setDoubleClickTrigger(prev => prev + 1);
      }
  };

  return (
    <div className={`App ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <Header />
      <div className='content'>
        <CardSearchPanel onNewDoubleClickData={handleDoubleClickData}/>
        <DeckViewPanel doubleClickData={doubleClickedData} doubleClickTrigger={doubleClickTrigger}/>
      </div>
    </div>
  );
}

// Wrap the App component with ThemeProvider
export default function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
