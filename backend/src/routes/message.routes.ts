import { Router } from "express";
import { getMessages } from "../controllers/messageController";
import { authMiddleware } from "../middlewares/authMiddleware";

const messageRouter = Router();

messageRouter.get("/get/:receiverId", authMiddleware, getMessages);

export default messageRouter;
