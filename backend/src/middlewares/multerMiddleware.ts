import multer from "multer";
import path from "path";

const rootPath = path.resolve();

// Conditionally switch between memory and disk storage
const storage =
  process.env.MEMORY === "true"
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, path.join(rootPath, "./public/images"));
        },
        filename: function (req, file, cb) {
          cb(null, `${Date.now()}.jpg`);
        },
      });

export const upload = multer({ storage });
