import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from the "public" directory
app.use("/static", express.static("public"));

// import routes
import userRouter from "./routes/user.routes";
import messageRouter from "./routes/message.routes";

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", messageRouter);

export { app };
