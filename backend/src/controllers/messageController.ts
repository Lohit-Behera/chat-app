import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Message } from "../models/messageModel";
import mongoose from "mongoose";

const getMessages = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  const senderId = req.user?._id;
  const aggregate = Message.aggregate([
    {
      $match: {
        $or: [
          {
            sender: new mongoose.Types.ObjectId(senderId),
            receiver: new mongoose.Types.ObjectId(receiverId),
          },
          {
            sender: new mongoose.Types.ObjectId(receiverId),
            receiver: new mongoose.Types.ObjectId(senderId),
          },
        ],
      },
    },
    { $sort: { createdAt: -1 } }, // Sort messages by most recent
  ]);

  const messages = await Message.aggregatePaginate(aggregate, {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 30,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages found successfully"));
});

export { getMessages };
