import React, { createContext, useReducer, useState } from 'react';
import socketIoClient from 'socket.io-client';

export const GeneralContext = createContext();

const WS = 'http://localhost:6001'; // Ensure this matches your backend URL

const socket = socketIoClient(WS, {
  transports: ['websocket'],
  withCredentials: true,
});

export const GeneralContextProvider = ({ children }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [chatFriends, setChatFriends] = useState([]);

  const INITIAL_STATE = {
    chatId: 'null',
    user: {},
  };

  const userId = localStorage.getItem('userId');
  console.log('UserId:', userId);
  
  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        const newChatId = [userId, action.payload._id].sort().join('_');
        console.log('New ChatId:', newChatId); 
        return {
          user: action.payload,
          chatId: newChatId
        };
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);
  
  console.log('Current state in GeneralContextProvider:', state); 
  
  
return (
    <GeneralContext.Provider value={{
      socket,
      isCreatePostOpen,
      setIsCreatePostOpen,
      isCreateStoryOpen,
      setIsCreateStoryOpen,
      isNotificationsOpen,
      setNotificationsOpen,
      notifications,
      setNotifications,
      chatFriends,
      setChatFriends,
      chatData: state,
      dispatch
    }}>
      {children}
    </GeneralContext.Provider>
  );
};
