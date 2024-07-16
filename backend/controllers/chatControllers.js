import { NEW_ATTACHMENT, NEW_MESSAGE_ALERT } from "../constants/events.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { ErrorHandler } from "../utils/errorUtility.js";
import { getOtherMember } from "../utils/helpers.js";
import { emitEvent } from "../utils/emitEvent.js";

const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ members: req.user }).populate(
      { path: 'members',
        select: 'url name'}
    ).populate('lastMessage')
    const transformedChats = chats.map(({ _id, name, members,lastMessage }) => {
      const otherMember = getOtherMember(members, req.user);
      return {
        _id,
        name: otherMember.name,
        members: members.reduce((prev, curr) => {
          if (curr._id.toString() !== req.user.toString()) {
            prev.push(curr._id);
          }
          return prev;
        }, []),
        lastMessage:lastMessage,
        url:otherMember.url
      };
    });
    return res.status(200).json({
      success: true,
      chats: transformedChats,
    });
  } catch (error) {
    next(error);
  }
};

const sendAttachments = async (req, res, next) => {
  try {
    const { chatId } = req.body;

    console.log(req.body)

    const [chat, me] = await Promise.all([
      Chat.findById(chatId),
      User.findById(req.user, "name"),
    ]);

    if (!chat) return next(new ErrorHandler("Chat not found", 404));


    const messageForDB = {
      content: "",
      sender: me._id,
      chat: chatId,
    };

    const messageForRealTime = {
      ...messageForDB,
      sender: {
        _id: me._id,
        name: me.name,
      },
    };

    const message = await Message.create(messageForDB);

    emitEvent(req, NEW_ATTACHMENT, chat.members, {
      message: messageForRealTime,
      chatId,
    });
    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, {
      chatId,
    });

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

const getChatDetails = async (req, res, next) => {
  try {
    // if (req.query.populate === "true") {
    //   const chat = await Chat.findById(req.params.id)
    //     .populate("members", "name")
    //     .lean();
    //   if (!chat) return next(new ErrorHandler("Chat not found", 404));

    //   chat.members = chat.members.map(({ _id, name, avatar }) => ({
    //     _id,
    //     name,
    //     avatar: avatar.url,
    //   }));

    //   return res.status(200).json({
    //     success: true,
    //     chat,
    //   });
    // } else {
      const chat = await Chat.findById(req.params.id).populate({
        path: 'members',
        select: 'name url'
    });

    chat.members = chat.members.filter(member => member._id.toString() !== req.user.toString());

      if (!chat) return next(new ErrorHandler("Chat not found", 404));
      return res.status(200).json({
        success: true,
        chat,
      });
    // }
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { page = 1 } = req.query;

    const resultPerPage = 20;
    const skip = (page - 1) * resultPerPage;

    const chat = await Chat.findById(chatId);

    if (!chat) return next(new ErrorHandler("Chat not found", 404));

    if (!chat.members.includes(req.user.toString()))
      return next(
        new ErrorHandler("You are not allowed to access this chat", 403)
      );

    const [messages, totalMessagesCount] = await Promise.all([
      Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(resultPerPage)
        .populate("sender", "name")
        .lean(),
      Message.countDocuments({ chat: chatId }),
    ]);
    
    const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;

    return res.status(200).json({
      success: true,
      messages: messages.reverse(),
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

export { getMyChats, sendAttachments, getChatDetails, getMessages };
