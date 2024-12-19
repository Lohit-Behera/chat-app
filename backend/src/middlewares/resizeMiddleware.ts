import sharp from "sharp";
import path from "path";
import fs from "fs";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response, NextFunction } from "express";

sharp.cache(false);

export const resizeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const files: Record<string, Express.Multer.File[]> | null =
    (req.files as Record<string, Express.Multer.File[]> | null) ||
    (req.file ? { image: [req.file as Express.Multer.File] } : null);

  if (files) {
    try {
      const fileFields = Object.keys(files);

      for (const fieldName of fileFields) {
        const fileArray = files[fieldName];

        for (const file of fileArray) {
          const originalName = file.originalname;
          const metadata = await sharp(file.buffer || file.path).metadata();
          const aspectRatio = (metadata.width || 1) / (metadata.height || 1);

          let newWidth = Math.min(1440, metadata.width || 1440);
          let newHeight = Math.round(newWidth / aspectRatio);

          if (newHeight > 1080) {
            newHeight = 1080;
            newWidth = Math.round(newHeight * aspectRatio);
          }

          if (process.env.MEMORY === "true") {
            const resizedImageBuffer = await sharp(file.buffer)
              .resize(newWidth, newHeight)
              .toFormat("jpeg")
              .jpeg({ quality: 70 })
              .toBuffer();

            file.buffer = resizedImageBuffer;
            file.filename = `resized-${Date.now()}-${originalName}`;
          } else {
            const imagePath = path.join(__dirname, file.path);
            const outputFilePath = path.join(
              __dirname,
              "./public/temp",
              `resized-${Date.now()}-${file.filename}`
            );

            await sharp(imagePath)
              .resize(newWidth, newHeight)
              .toFormat("jpeg")
              .jpeg({ quality: 70 })
              .toFile(outputFilePath);

            fs.unlinkSync(imagePath);
            file.path = outputFilePath;
            file.filename = `resized-${Date.now()}-${file.filename}`;
          }
        }
      }
      next();
    } catch (err) {
      console.error("Error processing image:", err);
      res
        .status(500)
        .json(
          new ApiResponse(
            500,
            (err as Error).message,
            "Something went wrong while processing the images"
          )
        );
    }
  } else {
    next();
  }
};
