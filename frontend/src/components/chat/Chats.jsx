import React, { useContext, useEffect } from 'react';
import { GeneralContext } from '../../context/GeneralContextProvider';

const Chats = () => {
  const { socket, chatFriends, setChatFriends, dispatch, chatData } = useContext(GeneralContext); // Corrected 'chatFirends' to 'chatFriends'
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    socket.emit('fetch-friends', { userId });

    socket.on("friends-data-fetched", ({ friendsData }) => {
      setChatFriends(friendsData);
    });

    // Cleanup on unmount
    return () => {
      socket.off("friends-data-fetched");
    };
  }, [socket, userId, setChatFriends]);

  const handleSelect = (data) => {
    console.log('Selecting chat:', data);
    dispatch({ type: "CHANGE_USER", payload: data });
    console.log('Updated chatData:', chatData);
  };
  
  useEffect(() => {
    if (chatData.chatId !== null) {
      socket.emit('fetch-messages', { chatId: chatData.chatId });
    }
  }, [socket, chatData]);

  return (
    <div className='chats'>
      {chatFriends.map((data) => (
        <div className="userInfo" key={data._id} onClick={() => handleSelect(data)}>
          <img src={data.profilePic} alt="" />
          <div className="userChatInfo">
            <span>friend1:{data.username}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
