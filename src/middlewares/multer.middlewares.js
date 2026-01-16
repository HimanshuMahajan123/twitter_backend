import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";

/**
 * Multer storage configuration
 * - Stores files temporarily on disk
 * - Files are later uploaded to Cloudinary and deleted
 */
const storage = multer.diskStorage({
  /**
   * Destination where files will be stored temporarily
   * NOTE: This folder should NOT be publicly served
   */
  destination(req, file, cb) {
    cb(null, "./public/temp");
  },

  /**
   * Generate a unique filename for each uploaded file
   * - Prevents overwriting files with the same name
   * - Preserves original file extension
   */
  filename(req, file, cb) {
    const uniqueSuffix = nanoid(6); // short unique id
    const ext = path.extname(file.originalname); // preserve extension
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter to validate uploaded file types
 * - Allows only image files for "images" field
 * - Allows only video files for "video" field
 * - Blocks all other file types (e.g. .js, .exe)
 */
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "images" && !file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }

  if (file.fieldname === "video" && !file.mimetype.startsWith("video/")) {
    return cb(new Error("Only video files are allowed"), false);
  }

  cb(null, true); // accept file
};

/**
 * Multer upload instance
 * - Uses disk storage
 * - Validates file type
 * - Limits file size to prevent abuse
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
  },
});

export default upload;
