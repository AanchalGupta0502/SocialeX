const mongoose = require('mongoose');

const SSchema = new mongoose.Schema({
    userId: { type: String },
    username: { type: String },
    userPic: { type: String }, // Ensure this field is present
    fileType: { type: String },
    file: { type: String },
    text: { type: String },         //viewers: { type: Array }
}, { timestamps: true });

const Story = mongoose.model('Story', SSchema);

module.exports = Story;
