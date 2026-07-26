import Categories from "../models/categoriesModel.js";
import ItemCards from "../models/itemCardsModel.js";
import express from 'express';
import requireAuth from "../middlewares/requireAuth.js"
import { vectorService } from "../services/vectorStore.js";
import { geminiService } from "../services/geminiService.js"
import redisClient from "../services/redisClient.js"
import { getCache, setCache, deleteCache } from "../services/cacheService.js";
// Importing firebase
import { uploadImage } from "../middlewares/uploadImage.js";
import { bucket } from "../services/firebaseAdmin.js" 

const categoriesRouter = express.Router();

// This is placed at the top because we want to protect everything below
categoriesRouter.use(requireAuth);

// GET all categories to the dropdown menu
categoriesRouter.get("/", async (req, res) => {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:categories`;

    try {
        // Try Redis first
        const cachedCategories = await getCache(cacheKey);

        if (cachedCategories) {
            return res.status(200).json(cachedCategories);
        }

        // Proceed to MongoDB if Redis failed and store that missing information to Redis
        const categories = await Categories.find({ userId: userId }).sort({ createdAt: -1 });
        await setCache(cacheKey, categories, 600);

        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// POST new category to the dropdown menu
categoriesRouter.post("/", async (req, res) => {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:categories`;

    try {
        const newCategory = new Categories(req.body);
        // Save the document in the database
        const savedCategory = await newCategory.save();

        // Delete the old cache in Redis
        await deleteCache(`user:${userId}:categories`);

        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a category 
// IMPORTANT!!!: "/:id" from the first line must match { id } from the req.params
// /:id tells Express: "Anything that comes after the slash is a variable I want to store in req.params
// If the URL is /api/categories/123, then req.params.id will be 123
categoriesRouter.delete("/:categoryId", async (req, res) => { 
    const { categoryId } = req.params;
    const userId = req.user.id;

    try {
        console.log("Delete request received for ID:", req.params.categoryId);

        // Delete the category from mongo and redis
        const deletedCategory = await Categories.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ error: "Category not found in database" });
        } 

        await deleteCache(`user:${userId}:categories`);

        // Delete all the items that belong to that category
        const deletedItem = await ItemCards.deleteMany({ category: categoryId})

        if (!deletedItem) {
            return res.status(404).json({ error: "Item not found in database" });
        }

        await deleteCache(`user:${userId}:category:${categoryId}:items`);

        // Once everything went through, send a message back to declare success
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Category delete error: ", err);
        res.status(500).json({ err: err.message });
    }
});

// PUT update a category (e.g., rename)
categoriesRouter.put('/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    const userId = req.user.id;

    try {
        const updated = await Categories.findOneAndUpdate(
            { _id: categoryId, userId: userId }, 
            { $set: req.body },
            { returnDocument: 'after', runValidators: true } 
        );

        if (!updated) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Delete the old cache in redis
        await deleteCache(`user:${userId}:categories`);

        res.status(200).json(updated);
    } catch (err) {
        console.error('Category update error:', err);
        res.status(500).json({ err: err.message });
    }
});

// GET items from a category
categoriesRouter.get("/:categoryId/itemCards", async (req, res) => {
    try {
        const { categoryId } = req.params;
        const userId = req.user.id;
        const cacheKey = `user:${userId}:category:${categoryId}:items`;

        // Try Redis first
        const cachedItems = await getCache(cacheKey);

        if (cachedItems) {
            console.log("CACHE HIT")
            return res.status(200).json(cachedItems)
        }

        console.log("CACHE MISS");

        // If Redis fails, try MongoDB
        const category = await Categories.findOne({
            _id: categoryId,
            userId: userId
        });

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        const items = await ItemCards.find({ category: categoryId }).sort({ createdAt: -1 });

        const response = {
            categoryName: category.name,
            items
        };

        // Store this missing item in Redis
        await setCache(cacheKey, response, 600);

        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ error: "Failed to get images" })
    }
});


// POST items to a category
// uploadImage.single("image") intercepts the multipart image data and creates req.file.
categoriesRouter.post("/:categoryId/itemCards", uploadImage.single("image"), async (req, res) => {
    const { categoryId } = req.params;
    const userId = req.user.id; // Fixes the ReferenceError bug!
    const cacheKey = `user:${userId}:category:${categoryId}:items`;

    try {
        // 1. Structural Validation check
        if (!req.file) {
            return res.status(400).json({ error: "Please select an image file to upload." });
        }

        // 2. Build a unique filename reference paths for Firebase Storage
        const uniqueFilename = `${userId}_${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
        const fileRef = bucket.file(`closet-items/${uniqueFilename}`);

        // 3. Stream the Multer RAM buffer directly up to Firebase
        await fileRef.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
            public: true // Enables viewing via a regular public URL string
        });

        // 4. Construct the permanent public asset link string
        const permanentImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;

        // 5. Combine user metadata and the new cloud image link into your schema payload
        const newItemData = {
            ...req.body,
            category: categoryId,
            userId: userId,
            file: permanentImageUrl, // Tiny string instead of massive raw base64 data!
            filePath: fileRef.name // Saves 'closet-items/uniqueFilename.jpg'
        };

        // 6. Record the document cleanly inside MongoDB
        const newItem = new ItemCards(newItemData);
        const savedItem = await newItem.save();

        // 7. Invalidate the Redis cache for this user's category items
        await deleteCache(cacheKey);
        
        // In Express, .json() only takes one argument (the data you want to send).
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// DELETE an item from the database
categoriesRouter.delete("/:categoryId/itemCards/:itemId", async (req, res) => {
    try {
        const { itemId, categoryId } = req.params; // IMPORTANT!!!: Please pay attention to whether it's a function or it's accessing an object's property
        const  userId = req.user.id;

        // Find the item that needs to be deleted
        const itemToDelete = await ItemCards.findOne({
            _id: itemId, 
            userId: userId  // Security Lock
        });

        if (!itemToDelete) {
            return res.status(404).json({ error: "Item not found in database" });
        }

        // Clear redis cache for this category's item
        await deleteCache(`user:${userId}:category:${categoryId}:items`);
        
        // Delete from firebase
        if (itemToDelete.filePath) {
            await bucket.file(itemToDelete.filePath).delete();
        }

        // Now delete the document record from MongoDB
        await ItemCards.findByIdAndDelete(itemId);


        // IMMEDIATELY respond 200 OK back to the frontend network channel
        res.status(200).json({ message: "Item deleted successfully" });

        // Delete this item's information from the index in Pipecone
        await vectorService.deleteItemCard(userId, itemId).catch(err => {
            console.error("Background vector deletion event tracking failure:", err);
        });
    } catch (err) {
        console.error("Item delete error: ", err);
        res.status(500).json({ err: err.message });
    }
});


// PUT (save) an item's form
// IMPORTANT!!!: PUT is for updating information
categoriesRouter.put("/:categoryId/:itemId", async (req, res) => {
    const { itemId, categoryId } = req.params; // IMPORTANT!!!: Please pay attention to whether it's a function or it's accessing an object's property
    const userId = req.user.id
    let newData = { ...req.body };

    try {
        console.log("server reached");

        // RUN THIS FIRST so user changes hit MongoDB instantly (Takes ~10ms)
        const savedItem = await ItemCards.findOneAndUpdate(
            { _id: itemId, userId },
            { $set: allowedFields },
            { new: true, runValidators: true }
        )

        if (!savedItem) {
            return res.status(404).json({ error: "Item not found in database" });
        }

        try {
            const geminiParagraph = await geminiService.generateItemContent({ 
                file: savedItem.file,
                brand: newData.brand,
                notes: newData.notes,
                url: newData.url,
                description: newData.description
            })

            console.log(geminiParagraph)
            
            // Add the newly created paragraph to the Item
            savedItem.geminiDescription = geminiParagraph;

            // Save the newly updated item with gemini description to mongodb
            await savedItem.save();
        } catch (error) {   
            console.error("AI generation failed, continue database sync")
        }

        // Clear the old Redis cache so the frontend sees the new edits!
        const cacheKey = `user:${userId}:category:${categoryId}:items`;
        await deleteCache(cacheKey);

        res.status(200).json(savedItem);

        // Upload this item's information to the index in Pipecone
        await vectorService.upsertItemCard(savedItem).catch(err => {
            console.error("Background vector update failure:", err);
        })

        console.log("Item saved successfully");
    } catch (err) {
        console.error("Item save error: ", err);
        res.status(500).json({ err: err.message });
    }
});

export default categoriesRouter;