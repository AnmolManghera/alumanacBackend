import jwt from "jsonwebtoken";

const cookieoptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

export const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, "afkslhdfhahi");
  return res.status(code).cookie("token", token).json({
    success: true,
    user,
    message,
  });
};
