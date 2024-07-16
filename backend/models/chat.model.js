import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    lastMessage:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    }]
},{timestamps: true})

const Chat = mongoose.model("Chat",chatSchema);
export default Chat;