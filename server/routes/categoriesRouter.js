import express from 'express';
import requireAuth from "../middlewares/requireAuth.js";
import { uploadImage } from "../middlewares/uploadImage.js";
import { emitProgress } from "../sockets/socketProgress.js";

// Controller functions
import { getCategories, createCategory, deleteCategory, updateCategory, getItemCards, createItemCard, deleteItemCard, updateItemCard } from "../controllers/categoriesControllers.js";

const categoriesRouter = express.Router();

// Protect all category routes
categoriesRouter.use(requireAuth);

// Get all categories
categoriesRouter.get("/", getCategories);

// Create a category
categoriesRouter.post("/", createCategory);

// Delete a category
categoriesRouter.delete("/:categoryId", deleteCategory);

// Update a category
categoriesRouter.put("/:categoryId", updateCategory);

// Get items from a category
categoriesRouter.get("/:categoryId/itemCards", getItemCards);

// Report progress before processing the uploaded image
const startUpload = (req, res, next) => {
    emitProgress(req.user.id, "upload-status", "Uploading");
    next();
};

// Process the image, then create the item
categoriesRouter.post("/:categoryId/itemCards", startUpload, uploadImage.single("image"), createItemCard);

// Delete an item
categoriesRouter.delete("/:categoryId/itemCards/:itemId", deleteItemCard);

// Update an item
categoriesRouter.put("/:categoryId/:itemId", updateItemCard);

export default categoriesRouter;
