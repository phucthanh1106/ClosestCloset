// middleware/imageUpload.js
import multer from "multer";
import path from "path";

// 1. Tell Multer to keep the file in short-term RAM memory buffers
const storageEngine = multer.memoryStorage();

// 2. Define a security filter to ensure users only upload actual images
const fileFilter = (req, file, callback) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        return callback(
            new Error("Only JPEG, PNG, and WebP images are allowed.")
        );
    }

    callback(null, true);
};

// 3. Export the fully configured Multer instance
export const uploadImage = multer({
  storage: storageEngine,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 1024 * 1024 * 5 // Strict 5MB limit per image to protect memory
  }
});