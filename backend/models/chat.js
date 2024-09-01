const mongoose =require("mongoose");

const cSchema=new mongoose.Schema({
    _id:{
        type:String,require:true
    },
    messages:{
        type:Array
    }
});

const chats=mongoose.model("chats",cSchema)
module.exports=chats;
