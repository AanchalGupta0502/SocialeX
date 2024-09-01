const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Ensure this path is correct
const User = require('../models/user'); // Ensure this path is correct
// Route to create a new post
router.post('/createPost', async (req, res) => {

    try {
        const newPost = new Post(req.body);


        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/fetchUserProfile/:userId', async (req, res) => {
  try {
      const userId = req.params.userId; // Use URL parameter
      const user = await User.findOne({ _id: userId });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(user);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
});
/*
router.get('/fetchUserName',async(req,res)=>{
    try {
      const userId = req.body.userId;
      const user = await User.findOne({_id: userId});
      console.log(userId);
      res.status(200).json(user);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
  } );
  */
  router.get('/fetchAllPosts' ,async (req, res) =>{
    try{   
    const posts = await Post.find().sort({ _id: -1 });

        res.json(posts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
}); 


module.exports = router;
