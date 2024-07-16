import jwt from "jsonwebtoken";
import { ErrorHandler } from "./errorUtility.js";
import User from "../models/user.model.js";

export const getOtherMember = (members,userId) =>{
    return members.find((member)=>member._id.toString() !== userId.toString());
}

export const socketAuthenticator = async (err,socket,next) => {
    try {
        if(err) {return next(err)};
        const authToken = socket.request.cookies['token'];
        if(!authToken) return next(new ErrorHandler("Please login to access"),401)

        const decodedUser = jwt.verify(authToken,"afkslhdfhahi");

        const user = await User.findById(decodedUser._id);
        if(!user) {
            return next(new ErrorHandler("Please login to access"),401)
        }

        socket.user = user
        return next()

    } catch (error) {
        return next(new ErrorHandler("Please login to access"),401)
    }
}