import logo from './logo.svg';
import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import Header from './components/layout/Header';

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
    <div className="App">
      <div id="content" className={darkMode ? 'dark-mode' : ''}>
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>
      </div>
    </div>
  );
}

export default App;
