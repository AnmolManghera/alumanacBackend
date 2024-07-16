import mongoose from "mongoose";
import {hash} from 'bcrypt'
  
const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type: String,
        required: true,
        select:false
    },
    url:{
        type : String,
        required:true,
    },
    year:{
        type:String,
    },
    field:{
        type:[String],
    },
    technology:{
        type:[String]
    },
    branch:{
        type:String,
    },
    availableSlots:{
        schedule:[String]
        //like "29-04-10" , "26-04-12"
    }
    
},{timestamps: true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) next();
    this.password = await hash(this.password,10)
})

const User = mongoose.model("User",userSchema);
export default User;