import React, { createContext, useState, useContext } from 'react';

const DoubleClickContext = createContext();

export function DoubleClickProvider({ children }) {
    const [doubleClickedData, setDoubleClickedData] = useState(null);
    const [doubleClickTrigger, setDoubleClickTrigger] = useState(0);

    const handleDoubleClickData = (data) => {
        setDoubleClickedData(data);
        setDoubleClickTrigger(prev => prev + 1);
    };

    return (
        <DoubleClickContext.Provider value={{ doubleClickedData, handleDoubleClickData, doubleClickTrigger }}>
            {children}
        </DoubleClickContext.Provider>
    );
}

export function useDoubleClick() {
    return useContext(DoubleClickContext);
}
