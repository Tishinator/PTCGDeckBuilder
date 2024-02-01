import React, {useState, useEffect, createContext } from "react";

const AppThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => {},
});

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      );
      
       
        
    // Toggle between 'light' and 'dark' themes
    const toggleTheme = () => {
        console.log('Current theme:', theme);
        setTheme(prevTheme => {
          const newTheme = prevTheme === 'light' ? 'dark' : 'light';
          console.log('New theme:', newTheme);
          return newTheme;
        });
      };
      

    useEffect(()=>{
        // Apply the dark mode class to the body
        document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
    
        // Store the user's preference in localStorage
        localStorage.setItem('theme', theme);
      },[theme]);
    
  
    return (
      <AppThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </AppThemeContext.Provider>
    );
  }
  
  export { ThemeProvider, AppThemeContext };