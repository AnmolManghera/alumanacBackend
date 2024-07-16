import mongoose from "mongoose";

const requestSchema = mongoose.Schema({
    requestType : {
        type:String,
        enum:["connection","interview"]
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    requestType:{
        type:String,
        enum:["CONNECTION","MOCK INTERVIEW"]
    },
    data:{
        type:String
    }

},{timestamps: true})

const Request = mongoose.model("Request",requestSchema);
export default Request;