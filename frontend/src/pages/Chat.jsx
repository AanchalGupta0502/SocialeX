import React from 'react'
import '../Styling/Chat.css'
import Navbar from '../components/NavigationBar'
import Sidebar from '../components/chat/Sidebar'
import UserChat from '../components/chat/UserChat'

const Chat = () => {
  return (
    <div className='chatPage'>
      {/* <HomeLogo /> */}
      <Navbar />

    <div className="home">

      <Sidebar  />
      <UserChat />
      
    </div>
    </div>
  )
}

export default Chat