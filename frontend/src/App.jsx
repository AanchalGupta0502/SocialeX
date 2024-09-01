
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import CreatePost from './components/CreatePost';
import CreateStory from './components/CreateStory';
import Notifications from './components/Notifications';
import AuthProtector from './RouteProtectors/AuthProtector';
  
function App() {
  return (
    <div className="App">
      <CreatePost />
      <CreateStory />
      <Notifications />
      <Routes>
      <Route path="/" element={<LandingPage />} />
        <Route path="/pages/Home" element={<Home />} />
        <Route path="/profile/:id" element={<AuthProtector><Profile /></AuthProtector>} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;

