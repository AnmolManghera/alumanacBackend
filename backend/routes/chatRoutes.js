import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getMyChats, sendAttachments ,getChatDetails,getMessages} from '../controllers/chatControllers.js';
import { attachmentsMulter } from '../middlewares/multer.js';

const app = express.Router();

//After here user must be authenticated
app.use(authMiddleware)
app.get("/my",getMyChats)
app.post("/message",sendAttachments)
app.get("/message/:id",getMessages)
app.route("/:id").get(getChatDetails).put().delete()

export default app;



