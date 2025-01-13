import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/userModel";
import { Response } from "express";

// generate access token and refresh token
const generateTokens = async (userId: string, res: Response) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json(new ApiResponse(404, null, "User not found"));
      return null;
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Something went wrong while generating tokens"
        )
      );
    return null;
  }
};

const userRegister = asyncHandler(async (req, res) => {
  // get the data from the request
  const { username, fullName, email, password } = req.body;
  // validate the data
  if (!username || !fullName || !email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required"));
  }
  // get avatar from the request
  const avatar = req.file?.filename;
  if (!avatar) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Avatar is required"));
  }

  // check if user already exists
  const userExists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User already exists"));
  }

  // create a user
  const user = await User.create({
    username,
    fullName,
    email,
    password,
    avatar: avatar,
  });
  // validate the user created
  const createdUser = await User.findOne({ _id: user._id });
  if (!createdUser) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User creation failed"));
  }
  // send the response
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

// login user
const userLogin = asyncHandler(async (req, res) => {
  // get data from req.body
  const { email, password } = req.body;

  // validate data
  if (!email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Please provide all required fields."));
  }

  // check user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Invalid credentials."));
  }

  // check password
  if (!(await user.comparePassword(password))) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid credentials."));
  }

  // generate tokens
  const tokens = await generateTokens(user._id, res);
  if (!tokens) {
    return; // Exit if tokens generation failed
  }
  const { accessToken, refreshToken } = tokens;

  const updatedUser = await User.findOne({ _id: user._id });

  // send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, updatedUser, "Login successful."));
});

// logout user
const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );
  // send response
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, null, "Logout successful."));
});

const userDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken -__v"
  );
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found."));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully."));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id;
  const users = await User.find({ _id: { $ne: currentUserId } }).select(
    "_id username avatar online"
  );
  if (!users) {
    return res.status(404).json(new ApiResponse(404, null, "Users not found."));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users found successfully."));
});

const receiverDetails = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  const user = await User.findById(receiverId).select(
    "-password -refreshToken -__v"
  );
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found."));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully."));
});

export {
  userRegister,
  userLogin,
  userLogout,
  userDetails,
  getAllUsers,
  receiverDetails,
};
