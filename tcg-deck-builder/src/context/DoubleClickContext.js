import React, { createContext, useState, useContext } from 'react';

const DoubleClickContext = createContext();

export function DoubleClickProvider({ children }) {
    const [doubleClickedData, setDoubleClickedData] = useState(null);

    const handleDoubleClickData = (data) => {
        setDoubleClickedData(data);
    };

    return (
        <DoubleClickContext.Provider value={{ doubleClickedData, handleDoubleClickData }}>
            {children}
        </DoubleClickContext.Provider>
    );
}

export function useDoubleClick() {
    return useContext(DoubleClickContext);
}
