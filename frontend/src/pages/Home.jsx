
import React from 'react';
import '../Styling/homepage.css';
import Post from '../components/Post';
import HomeLogo from '../components/HomeLogo';
import Navigationbar from '../components/NavigationBar';
import Stories from '../components/Stories';
const Home = () => {
  return (
    <div className='homePage'>
     <HomeLogo />     
     <Navigationbar/> 
     <Stories />
     <Post/>
    </div>
  )
}

export default Home
