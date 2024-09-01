const express = require('express');
const router = express.Router();
const Story = require('../models/Story'); // Ensure the path is correct

// Route to fetch all stories
router.get('/fetchAllStories', async (req, res) => {
    try {
        const stories = await Story.find().sort({ createdAt: -1 });
        console.log(stories);
        res.json(stories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to create a new story
/*
router.post('/createStory', async (req, res) => {
    const { userId, username, userPic, fileType, file, text } = req.body; // Ensure 'userPic' is included here

    try {
        const newStory = new Story({
            userId,
            username,
            userPic, // Ensure this matches with the schema field
            fileType,
            file,
            text
        });

        const savedStory = await newStory.save();
        res.status(201).json(savedStory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
*/
module.exports = router;
