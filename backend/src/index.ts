import dotenv from "dotenv";
import connectDB from "./db/db";
import { app } from "./app";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
    app.on("error", (error) => {
      console.log(`Server error: ${error}`);
    });
  })
  .catch((err: Error) => console.log(`mongoDB connection error: ${err}`));
