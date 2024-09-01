
import React, { createContext, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthenticationContext = createContext();

const AuthenticationContextProvider = ({children}) => {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const profilePic = 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80';

  const inputs = {username, email, password, profilePic};

  const navigate = useNavigate();

  const login = async () => {
    try {
      const loginInputs = { email, password };
      console.log("Email:", email, "Password:", password);

      // Make the request
      const response = await axios.post('http://localhost:6001/api/auth/login', loginInputs);

      // Handle the response
      console.log("Response:", response.data);

      // Save data to localStorage
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('email', response.data.user.email);
      localStorage.setItem('profilePic', response.data.user.profilePic);
      localStorage.setItem('posts', JSON.stringify(response.data.user.posts)); // Store as JSON
      localStorage.setItem('followers', JSON.stringify(response.data.user.followers)); // Store as JSON
      localStorage.setItem('following', JSON.stringify(response.data.user.following)); // Store as JSON

      //  to  home page
      navigate('/pages/Home'); 

    } catch (err) {
      // Improved error logging
      if (err.response) {
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
        console.error('Error headers:', err.response.headers);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
      console.error('Error config:', err.config);
    }
  };

  const register = async () => {
    try {
      const response = await axios.post('http://localhost:6001/api/auth/register', inputs);

      // Save data to localStorage
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('email', response.data.user.email);
      localStorage.setItem('profilePic', response.data.user.profilePic);
      localStorage.setItem('posts', JSON.stringify(response.data.user.posts)); // Store as JSON
      localStorage.setItem('followers', JSON.stringify(response.data.user.followers)); // Store as JSON
      localStorage.setItem('following', JSON.stringify(response.data.user.following)); // Store as JSON

      // Navigate to the home page
      navigate('/pages/Home');

    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    // Clear localStorage
    localStorage.clear();

    // Navigate to the landing page
    navigate('/');
  };

  return (
    <AuthenticationContext.Provider 
      value={{ 
        login, 
        register, 
        logout, 
        username, 
        setUsername, 
        email, 
        setEmail, 
        password, 
        setPassword 
      }}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export default AuthenticationContextProvider;
