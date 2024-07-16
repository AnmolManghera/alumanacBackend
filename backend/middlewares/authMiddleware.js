import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ErrorHandler } from "../utils/errorUtility.js";

const authMiddleware = async(req,res,next)=>{
    try {
        const token = req.cookies['token'];
        if(!token) return next(new ErrorHandler("Please login to access",401));
        const decodedUser = jwt.verify(token,"afkslhdfhahi");
        req.user = decodedUser._id;
        next();
    } catch (error) {
        next(error)
    }
}

export {authMiddleware};