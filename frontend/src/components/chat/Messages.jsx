import React, { useContext, useEffect, useState } from 'react'
import Message from './Message'
import { GeneralContext } from '../../context/GeneralContextProvider';

const Messages = () => {

  const {socket} = useContext(GeneralContext)
  const [messages, setMessages] = useState([]);
  const {chatData} = useContext(GeneralContext);

  useEffect(() => {
    const handleMessagesUpdated = ({ chat }) => {
      console.log('Messages updated:', chat);
      if (chat) {
        setMessages(chat.messages);
      }
    };
  
    const handleNewMessage = ({ message }) => {
      console.log('New message received:', message);
      if (chatData.chatId === message.chatId) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
    };
  
    socket.on('messages-updated', handleMessagesUpdated);
    socket.on('message-from-user', handleNewMessage);
  
    return () => {
      socket.off('messages-updated', handleMessagesUpdated);
      socket.off('message-from-user', handleNewMessage);
    };
  }, [socket, chatData]);
  

  return (
    <div className='messages' >
      
      {messages.length > 0 &&  messages.map((message)=>(
        <Message message={message} key={message.id} />
      ))
      }
</div>
  )
}
export default Messages