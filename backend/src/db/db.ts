import mongoose from "mongoose";

const mongoURI =
  process.env.MONGODB_URI || "mongodb://database:27017/mydatabase";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
