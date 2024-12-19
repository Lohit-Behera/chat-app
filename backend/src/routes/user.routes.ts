import { Router } from "express";
import { upload } from "../middlewares/multerMiddleware";
import { resizeImage } from "../middlewares/resizeMiddleware";
import {
  userRegister,
  userDetails,
  userLogin,
  userLogout,
} from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const userRouter = Router();

// Public routes
userRouter.post(
  "/register",
  upload.single("avatar"),
  resizeImage,
  userRegister
);

userRouter.post("/login", userLogin);

// Protected routes
userRouter.get("/details", authMiddleware, userDetails);
userRouter.get("/logout", authMiddleware, userLogout);

export default userRouter;
