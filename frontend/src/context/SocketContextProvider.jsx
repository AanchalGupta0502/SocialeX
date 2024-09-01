import React, { createContext, useEffect, useState } from 'react';
import socketIoClient from 'socket.io-client';

export const SocketContext = createContext();

const WS = 'http://localhost:6001'; // Ensure this matches your backend URL

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = socketIoClient(WS, {
            transports: ['websocket'],
            withCredentials: true,
        });

        // Handle connection errors
        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // Handle successful connection
        newSocket.on('connect', () => {
            console.log('Socket connected');
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                try {
                    newSocket.close();
                    console.log('Socket disconnected');
                } catch (error) {
                    console.error('Error closing the socket:', error);
                }
            }
        };
        
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
