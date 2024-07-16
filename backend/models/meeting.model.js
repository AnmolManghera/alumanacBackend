import mongoose from "mongoose";

const meetingSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    date:{
        type:String,
        required:true,
    },
    time:{
        type:String,
        required:true,
    },
    url:{
        type:String,
        required:true,
    }
},{timestamps: true})

const Meeting = mongoose.model("Meeting",meetingSchema);
export default Meeting;