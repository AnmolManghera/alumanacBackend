import express from "express";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";
import { createUser } from "./seeders/user.js";
import { corsOptions } from "./utils/corsOptions.js";

import {
  createMessages,
  createMessagesInAChat,
  createSingleChats,
} from "./seeders/chat.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./constants/events.js";
import Message from "./models/message.model.js";
import Chat from './models/chat.model.js'
import cors from "cors";


import { v4 as uuid } from "uuid";
import { socketAuthenticator } from "./utils/helpers.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

connectDB();
// createUser(50);
// createSingleChats();
// createMessagesInAChat('6612fdd9c5c00ffc5d57b058',100)
app.set("io", io);

const userSocketIds = new Map();
const rooms = {};
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.use(cors(corsOptions));

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("This is the home page");
});

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on("connection", (socket) => {
  // console.log(socket)
  const user = socket.user;
  // console.log(user)
  userSocketIds.set(user._id.toString(), socket.id);
  // console.log(userSocketIds);

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    // console.log(members , message , chatId)
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
    };
    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };
    const neededSockets = members.map((member) =>
      userSocketIds.get(member?.toString())
    );
    console.log(neededSockets);
    io.to(neededSockets).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });

    try {
      const newMessageCreated = await Message.create(messageForDB);
      console.log(newMessageCreated)
      await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessageCreated._id });
    } catch (error) {
      console.log(error);
    }
  });
  const leaveRoom = ({ roomId, peerId }) => {
    if (rooms[roomId]) rooms[roomId] = rooms[roomId].filter((id) => id !== peerId)
    socket.to(roomId).emit("user-disconnected", peerId)
  }
  const joinRoom = ({ roomId, peerId }) => {
    if (rooms[roomId]) rooms[roomId].push(peerId);
    else {
      rooms[roomId] = [];
      rooms[roomId].push(peerId);
    }

    socket?.join(roomId);
    socket.to(roomId).emit("user-joined", { peerId })
    socket.emit("get-users", {
      roomId,
      participants: rooms[roomId],
    });
    console.log("user joined the room", roomId, peerId);

    socket.on("disconnect", () => {
      console.log(peerId)
      leaveRoom({ roomId, peerId })
    })
  };

  socket.on("join-room", joinRoom);

  socket.on("create-room", () => {
    // console.log(socket)
    const roomId = uuid();
    rooms[roomId] = [];
    socket?.emit("room-created", { roomId });
    console.log("Emitting event to ", socket?.id, " for ", roomId);
    console.log("user created the room");
  });
  socket.on("disconnect", () => {
    userSocketIds.delete(user._id.toString());
    console.log("User Disconnected");
  });
});

app.use(errorHandler);
server.listen(5000);

export { userSocketIds };
