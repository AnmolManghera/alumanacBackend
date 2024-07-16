import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import Request from "../models/request.model.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Meeting from "../models/meeting.model.js";
import { emitEvent } from "../utils/emitEvent.js";
import { ErrorHandler } from "../utils/errorUtility.js";
import { sendToken } from "../utils/generateToken.js";
import { compare } from "bcrypt";
import {v4 as uuid} from "uuid"
import mongoose from "mongoose";


const avatar = {
  public_id: "asfa",
  url: "fadfsd",
};

//Create new user save in database and save token in cookie
const register = async (req, res, next) => {
  try {
    const {
      username,
      name,
      password,
      field,
      technologies,
      year,
      finalEmail,
      imageUrl,
    } = req.body;
    const user = await User.create({
      name,
      username,
      email: finalEmail,
      password,
      year,
      field,
      technology: technologies,
      url: imageUrl,
    });
    sendToken(res, user, 201, "User Created");
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid Username or Password", 400));
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch)
      return next(new ErrorHandler("Invalid Username or Password", 400));

    sendToken(res, user, 200, `Welcome Back, ${user.name}`);
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const cookieoptions = {
  maxAge: 0,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user);

    res.status(200).cookie("token", "", cookieoptions).json({
      success: true,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    next(error);
  }
};

const searchUser = async (req, res, next) => {
  try {
    const { page = 1, tech, branch, year, query } = req.query;

    const myConnections = await Chat.find({members:req.user._id});
    console.log(myConnections)
    const connections = myConnections.flatMap((chat)=>chat.members)
    // Construct filter object
    const filter = { };
    filter._id = {$nin:connections};
    if (year) filter.year = { $in: year };
    if (tech) {
      filter.technology = { $in: tech};
    }
    if (branch) {
      filter.branch = {$in : branch}
    }
    if (query) {
      filter.$or = [
        { name: { $regex: new RegExp(query, "i") } },
        { username: { $regex: new RegExp(query, "i") } },
      ];
    }
    
    console.log(connections);
    // Pagination
    const perPage = 6;
    const skip = (page - 1) * perPage;

    // Fetch users based on filter and pagination
    const count = await User.find(filter).countDocuments();
    const users = await User.find(filter).skip(skip).limit(perPage);
    
  

    res.json({users,count});
  } catch (error) {
    console.log(error);
  }
};

const sendFriendRequest = async (req, res, next) => {
  const { userId ,type} = req.body;
  console.log(req.user);
  // const request = await Request.findOne({
  //   $or: [
  //     { sender: req.user, receiver: userId },
  //     { receiver: userId, sender: req.user },
  //   ],
  // });

  // if (request) return next(new ErrorHandler("Request already sent", 400));

  const senderName = await User.findById(req.user);

  const newReq = await Request.create({
    sender: req.user,
    senderName,
    receiver: userId,
    requestType:type
  });

  emitEvent(req, NEW_REQUEST, [userId], {
    reqId: newReq?._id,
    sender: senderName?.username,
  });
  console.log([userId], userId);

  return res.status(200).json({
    success: true,
    message: "Request Sent",
  });
};
const sendInterviewRequest = async (req, res, next) => {
  const { requestId,reqTD} = req.body;
  console.log(req.user);
  // const request = await Request.findOne({
  //   $or: [
  //     { sender: req.user, receiver: userId },
  //     { receiver: userId, sender: req.user },
  //   ],
  // });

  // if (request) return next(new ErrorHandler("Request already sent", 400));

  const senderName = await User.findById(req.user);

  const newReq = await Request.create({
    requestType:"MOCK INTERVIEW",
    sender: req.user,
    data:reqTD,
    receiver: requestId,
  });

  emitEvent(req, NEW_REQUEST, [requestId], {
    reqId: newReq?._id,
    sender: senderName?.username,
    type: "MOCK INTERVIEW"
  });
  // console.log([userId], userId);

  return res.status(200).json({
    success: true,
    message: "Interview Request Sent",
  });
};

const acceptFriendRequest = async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await Request.findById(requestId);

  if (!request) return next(new ErrorHandler("Requst not sent", 404));

  if (!accept) {
    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Friend Request Rejected",
    });
  }

  const members = [request.sender._id, request.receiver._id];

  await Chat.create({
    members,
    name: `${request.sender.name}-${request.receiver.name}`,
  });

  await request.deleteOne();

  // emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
  });
};

const acceptInterviewRequest = async (req, res, next) => {
  const { requestId, accept,reqTD} = req.body;

  const request = await Request.findById(requestId);

  if (!request) return next(new ErrorHandler("Reqeust not sent", 404));

  if (!accept) {
    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Interview Request Rejected",
    });
  }

  const members = [request.sender._id, request.receiver._id];

  const roomId = new mongoose.Types.ObjectId();
  console.log(roomId);
  const url = `http://localhost:5000/room/${roomId}`
  await Meeting.create({
    _id:roomId,
    name: `${request.sender.name}-${request.receiver.name}`,
    members,
    date:reqTD.substring(0,5),
    time:reqTD.substring(6),
    url
  });

  await request.deleteOne();

  // emitEvent(req, REFETCH_MEETINGS, members);

  return res.status(200).json({
    success: true,
    message: "Interview Request Accepted",
    senderId: request.sender._id,
  });
};

const getMyNotifications = async (req, res, next) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name url field",
  );

  const allRequests = requests.map(({ _id, sender,requestType,data}) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      url: sender.url,
    },
    requestType,
    data
  }));

  return res.status(200).json({
    success: true,
    allRequests,
  });
}

const updateAvailableSlots = async(req,res,next)=>{
  try {
    const {schedule} = req.body;

    const user = await User.findOneAndUpdate(
      { _id:req.user},
      { availableSlots: schedule },
    );

    return res.status(200).json({
      success: true,
      message: "Slots Updated"
    });
  } catch (error) {
    console.log(error)
  }

}

const getInterviews = async(req,res,next)=>{
  const interviews = await Meeting.find({members:req.user}).populate({ path: 'members',
    select: 'url name'});
  return res.status(200).json({
    interviews:interviews
  })
}

const getUsersForInterviews = async(req,res,next) => {
  // console.log(req.user)
  const {reqTD} = req.body;
  const users = await User.find({ availableSlots: { $in: [reqTD] }}).limit(5)
  // console.log(users)
  return res.status(200).json({
    users:users
  });
}

const getUserSchedule = async(req,res,next) => {
  const userSchedule = await User.findOne({_id:req.user});
  const schedule = userSchedule.availableSlots
  // console.log(schedule)
  return res.status(200).json({
    success: true,
    schedule:schedule
  });
}

export {
  login,
  register,
  getMyProfile,
  logout,
  searchUser,
  sendFriendRequest,
  getMyNotifications,
  acceptFriendRequest,
  getUserSchedule,
  updateAvailableSlots,
  getUsersForInterviews,
  sendInterviewRequest,
  acceptInterviewRequest,
  getInterviews
};
