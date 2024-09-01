const express = require('express');
const cors = require('cors'); 
const connectDB = require('./db');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/story');
const postRoutes = require('./routes/post');
const User = require('./models/user');
const Story = require('./models/Story');
const Post=require('./models/Post');
const Chats=require('./models/chat');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect Database with Error Handling
connectDB().catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  methods: ["GET", "POST"],
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/story', storyRoutes);

// Utility functions
const findUserByUserId = async (id) => {
  try {
    console.log(id);
    const user = await User.findOne({_id: id});
    return user;
  } catch (error) {
    throw new Error('Error finding user');
  }
};

const findUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user;
  } catch (error) {
    throw new Error('Error finding user');
  }
};

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle creating a new story
  socket.on('create-new-story', async (data) => {
    console.log(data);
    try {
      const storyData = new Story(data);
      await storyData.save();
      socket.emit('story-created');
    } catch (error) {
      console.error(error.message);
    }
  });

  // Handle user search
  socket.on('user-search', async (data) => {
    console.log('Search request received:', data.username);
    try {
      const user = await findUserByUsername(data.username); 
      socket.emit('searched-user', { user });
    } catch (error) {
      console.error('Error during search:', error);
    }
  });

  // Handle profile fetch
  socket.on('fetch-profile', async ({ _id }) => {
    console.log('Fetching profile for id:', _id);
    try {
      const user = await findUserByUserId(_id);
      console.log('Fetched user:', user);
      socket.emit('profile-fetched', { profile: user });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  });

  // Handle liking a post
  socket.on('postLiked', async ({ userId, postId }) => {
    try {
      const post = await Post.findById(postId);  // Assuming you have a Post model
      post.likes.push(userId);
      await post.save();
      io.emit('likeUpdated', { postId, likes: post.likes });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  });

  // Handle unliking a post
  socket.on('postUnLiked', async ({ userId, postId }) => {
    try {
      const post = await Post.findById(postId);
      post.likes = post.likes.filter(id => id !== userId);
      await post.save();
      io.emit('likeUpdated', { postId, likes: post.likes });
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  });

  // Handle following a user
  socket.on('followUser', async ({ ownId, followingUserId }) => {
    try {
      const user = await User.findById(ownId);
      user.following.push(followingUserId);
      await user.save();

      const followedUser = await User.findById(followingUserId);
      followedUser.followers.push(ownId);
      await followedUser.save();

      socket.emit('userFollowed', { following: user.following });
    } catch (error) {
      console.error('Error following user:', error);
    }
  });

  // Handle unfollowing a user
  socket.on('unFollowUser', async ({ ownId, followingUserId }) => {
    try {
      const user = await User.findById(ownId);
      user.following = user.following.filter(id => id !== followingUserId);
      await user.save();

      const followedUser = await User.findById(followingUserId);
      followedUser.followers = followedUser.followers.filter(id => id !== ownId);
      await followedUser.save();

      socket.emit('userFollowed', { following: user.following });
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  });

  // Handle commenting on a post
  socket.on('makeComment', async ({ postId, username, comment }) => {
    try {
      const post = await Post.findById(postId);
      post.comments.push({ username, comment });
      await post.save();
      io.emit('commentAdded', { postId, comments: post.comments });
    } catch (error) {
      console.error('Error making comment:', error);
    }
  });

  // Handle deleting a post
  socket.on('delete-post', async ({ postId }) => {
    try {
      await Post.findByIdAndDelete(postId);
      io.emit('postDeleted', { postId });
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  });
  socket.on('updateProfile', async ({ userId, profilePic, username, about }) => {
    try {
      const user = await User.findById(userId);

      if (user) {
        user.profilePic = profilePic || user.profilePic;
        user.username = username || user.username;
        user.about = about || user.about;

        await user.save();

        // Notify the client that the profile was updated
        socket.emit('profileUpdated', { userId: user._id, profilePic: user.profilePic, username: user.username, about: user.about });

        // Optionally, you can broadcast the updated profile to all clients if needed
        // io.emit('profileUpdated', { userId: user._id, profilePic: user.profilePic, username: user.username, about: user.about });
      } else {
        socket.emit('error', { message: 'User not found' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      socket.emit('error', { message: 'Error updating profile' });
    }
  });
      // Handler for fetching friends data
    socket.on('fetch-friends', async ({ userId }) => {
      try {
        // Find the user by their ID
        const userData = await User.findOne({ _id: userId });
  
        if (userData) {
          // Find common friends (those who are both following and followed by the user)
          const friendsList = userData.following.filter(id => userData.followers.includes(id));
  
          // Fetch friend details
          const friendsData = await User.find(
            { _id: { $in: friendsList } },
            { _id: 1, username: 1, profilePic: 1 }
          ).exec();
  
          // Emit the friends data back to the client
          socket.emit('friends-data-fetched', { friendsData });
        } else {
          socket.emit('friends-data-fetched', { friendsData: [] });
        }
      } catch (error) {
        console.error('Error fetching friends data:', error);
      }
    });
  
    // Handler for fetching messages from a chat
    socket.on('fetch-messages', async ({ chatId }) => {
      try {
        // Find the chat by its ID
        const chat = await Chats.findOne({ _id: chatId }).exec();
  
        if (chat) {
          // Emit the chat messages back to the client
          socket.emit('messages-updated', { chat });
        } else {
          socket.emit('messages-updated', { chat: null });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });
  
    // Other existing handlers...
    socket.on('update-messages', async ({ chatId }) => {
      try {
        // Find the chat by its ID
        const chat = await Chats.findOne({ _id: chatId }).exec();
  
        if (chat) {
          // Emit the updated chat messages to the requesting client
          socket.emit('messages-updated', { chat });
        } else {
          socket.emit('messages-updated', { chat: null });
        }
      } catch (error) {
        console.error('Error updating messages:', error);
      }
    });
     // Handle searching for a user
     socket.on('new-message', async ({ chatId, id, text, file, senderId, date }) => {
      try {
        console.log('Adding message to chat:', { chatId, id, text, file, senderId, date });
    
        const chat = await Chats.findOneAndUpdate(
          { _id: chatId },
          { $addToSet: { messages: { id, text, file, senderId, date } } },
          { new: true, upsert: true } // Add `upsert: true` to create the chat if it doesn't exist
        );
    
        if (chat) {
          console.log('Message added successfully:', chat);
    
          // Emit the updated chat messages to the requesting client
          socket.emit('messages-updated', { chat });
    
          // Broadcast the new message to all other clients in the same chat
          socket.broadcast.to(chatId).emit('message-from-user', { message: { id, text, file, senderId, date, chatId } });
        } else {
          console.error('Chat not found and was not created:', chatId);
        }
      } catch (error) {
        console.error('Error adding new message:', error);
      }
    });
    
    
  // Other socket event handlers...
  socket.on('new-message', async ({ chatId, id, text, file, senderId, date }) => {
    try {
      // Find the chat and add the new message to it, or create the chat if it doesn't exist
      let chat = await Chats.findOneAndUpdate(
        { _id: chatId },
        { $addToSet: { messages: { id, text, file, senderId, date } } },
        { new: true, upsert: true } // 'upsert: true' creates the chat if it doesn't exist
      );
  
      if (chat) {
        console.log('Message added successfully:', chat);
  
        // Emit the updated chat messages to the requesting client
        socket.emit('messages-updated', { chat });
  
        // Broadcast the new message to all other clients in the same chat
        socket.broadcast.to(chatId).emit('message-from-user', { message: { id, text, file, senderId, date } });
      }
    } catch (error) {
      console.error('Error adding new message:', error);
    }
  });
  
  // Handle messaging (if necessary)
  socket.on('message', (data) => {
    console.log('Message received:', data);
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 6001;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
