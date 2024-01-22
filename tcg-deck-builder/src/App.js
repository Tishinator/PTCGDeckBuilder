import React, { useEffect, useState } from 'react';
import './App.css';
import './DarkMode.css';
import './LightMode.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import Header from './components/layout/Header';
import CardSearchPanel from './components/layout/CardSearchPanel';
import DeckViewPanel from './components/layout/DeckViewPanel';

function App() {
  const [darkMode, setDarkMode] = useState(    
    localStorage.getItem('darkMode') === 'true' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches);
  

  useEffect(()=>{
    // Apply the dark mode class to the body
    document.body.classList.toggle('dark-mode', darkMode);

    // Store the user's preference in localStorage
    localStorage.setItem('darkMode', darkMode);
  },[darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  }

  return (
  <div className={`App ${darkMode ? 'dark-theme' : 'light-theme'}`}>
    <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>
    <div className='content'>
      <CardSearchPanel />
      <DeckViewPanel />
    </div>
  </div>
  );
}

export default App;
