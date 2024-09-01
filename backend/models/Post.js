const mongoose =require("mongoose");

const PSchema=mongoose.Schema({
    userId:{type:String},
    userName:{type:String},
    userPic:{type:String},
    fileType:{type:String},
    file:{type:String},
    description:{type:String},
    location:{type:String},
    likes:{type:Array},
    comments:{type:Array}
},{timestamps:true});
 
const post=mongoose.model("posts",PSchema);
module.exports=post;