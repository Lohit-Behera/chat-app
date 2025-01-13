import { asyncHandler } from "../utils/asyncHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/userModel";
import { Request, Response, NextFunction } from "express";

// Helper function to check if the token has expired
function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp! < currentTime;
  } catch (err) {
    return true;
  }
}

// Auth Middleware function
export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token: string = req.cookies.accessToken || "";

      // Check if the access token is expired
      const isAccessTokenExpired = isTokenExpired(token);

      if (!req.cookies.accessToken || isAccessTokenExpired) {
        let refreshToken: string | undefined = req.cookies.refreshToken;

        // Check if refresh token is missing
        if (!refreshToken) {
          const user = await User.findById(
            JSON.parse(req.cookies.userInfoBlog)._id
          );
          if (!user) {
            return res
              .status(401)
              .json(new ApiResponse(401, {}, "Invalid token"));
          }
          refreshToken = user.refreshToken || "";
        }

        // Check if the refresh token is expired
        const isRefreshTokenExpired = isTokenExpired(refreshToken);
        if (isRefreshTokenExpired) {
          return res
            .status(401)
            .json(new ApiResponse(401, {}, "Refresh token expired"));
        }

        // Verify the refresh token and retrieve the user
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as JwtPayload;
        const user = await User.findById(decoded.id);
        // If user not found
        if (!user) {
          return res
            .status(401)
            .json(new ApiResponse(401, {}, "Invalid token"));
        }

        // Generate new access and refresh tokens
        const newAccessToken = user.generateAccessToken();
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        const newRefreshToken = user.generateRefreshToken();
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        token = newAccessToken; // Update token to new access token
      }

      if (!token) {
        return res
          .status(401)
          .json(new ApiResponse(401, {}, "You are Unauthorized"));
      }

      // Verify the access token and retrieve the user
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;
      const user = await User.findById(decoded.id);

      // If user not found
      if (!user) {
        return res
          .status(401)
          .json(new ApiResponse(401, {}, "Invalid token, user not found"));
      }

      req.user = user; // Attach user to the request object
      next();
    } catch (error: any) {
      console.log(error);
      return res
        .status(401)
        .json(
          new ApiResponse(
            401,
            error.message,
            "Invalid token in auth middleware"
          )
        );
    }
  }
);
