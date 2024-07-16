import express from 'express'
import { getMyProfile, login, register,logout ,searchUser,getMyNotifications,sendFriendRequest,acceptFriendRequest,getUserSchedule,updateAvailableSlots,getUsersForInterviews,sendInterviewRequest,acceptInterviewRequest,getInterviews} from '../controllers/userControllers.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { loginValidator, registerValidator, validateHandler } from '../utils/validators.js';

const app = express.Router();

app.post("/register",register)
app.post("/login",login)

//After here user must be authenticated
app.use(authMiddleware)
app.get("/me",getMyProfile)
app.get("/logout",logout)
app.get("/users",searchUser)
app.post("/sendConnectionRequest",sendFriendRequest);
app.post("/acceptConnectionrequest",acceptFriendRequest)
app.get("/notifications",getMyNotifications)
app.get("/schedule",getUserSchedule)
app.post("/updateschedule",updateAvailableSlots)
app.post("/getusersforinterviews",getUsersForInterviews)
app.post("/requestinterview",sendInterviewRequest)
app.post("/acceptinterviewrequest",acceptInterviewRequest)
app.get("/interviews",getInterviews)
export default app;



