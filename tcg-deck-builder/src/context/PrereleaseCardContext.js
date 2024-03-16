import React, {useState, useEffect, createContext } from "react";

const PrereleaseCardContext = createContext({
    useProxy: false,
    toggleProxy: () => {},
});

function ProxyContextProvider({ children }) {
    const [useProxy, setUseProxy] = useState(false);
      
    
    const toggleProxy = () => {
        console.log('use Proxy?:', useProxy);
        setUseProxy(prev => {
          
          console.log('New state:', !prev);
          return !prev;
        });
      };
      
    return (
      <PrereleaseCardContext.Provider value={{ useProxy, toggleProxy }}>
        {children}
      </PrereleaseCardContext.Provider>
    );
  }
  
  export { ProxyContextProvider, PrereleaseCardContext };