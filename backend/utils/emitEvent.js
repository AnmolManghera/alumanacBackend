import { userSocketIds } from "../server.js";

export const emitEvent = (req, event, members, data) => {
    const io = req.app.get("io");
    const neededSockets = members.map((member) =>
      userSocketIds.get(member?.toString())
    );
    console.log(neededSockets, "For the event ", event);
    io.to(neededSockets).emit(event, data);
  };
  