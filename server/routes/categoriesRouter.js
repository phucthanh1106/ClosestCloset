import Categories from "../models/categoriesModel.js";
import ItemCards from "../models/itemCardsModel.js";
import express from 'express';
import requireAuth from "../middlewares/requireAuth.js"
import { vectorService } from "../services/vectorStore.js";
import { geminiService } from "../services/geminiService.js"

const categoriesRouter = express.Router();

// This is placed at the top because we want to protect everything below
categoriesRouter.use(requireAuth);

// GET all categories to the dropdown menu
categoriesRouter.get("/", async (req, res) => {
    const id = req.user.id;

    try {
        const categories = await Categories.find({ userId: id }).sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// POST new category to the dropdown menu
categoriesRouter.post("/", async (req, res) => {
    try {
        const newCategory = new Categories(req.body);
        // Save the document in the database
        const savedCategory = await newCategory.save();

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
    try {
        console.log("Delete request received for ID:", req.params.categoryId);
        const { categoryId } = req.params;

        const deletedCategory = await Categories.findByIdAndDelete(categoryId);
        const deletedItem = await ItemCards.deleteMany({ category: categoryId})

        if (!deletedCategory) {
            return res.status(404).json({ error: "Category not found in database" });
        } 

        if (!deletedItem) {
            return res.status(404).json({ error: "Item not found in database" });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Category delete error: ", err);
        res.status(500).json({ err: err.message });
    }
});

// PUT update a category (e.g., rename)
categoriesRouter.put('/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;

        const updated = await Categories.findByIdAndUpdate(
            categoryId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Category not found' });
        }

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

        // Find the category item
        const category = await Categories.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        const categoryName = category.name;
        
        const items = await ItemCards.find({ category: categoryId }).sort({ createdAt: -1 });
        res.json({ categoryName, items });
    } catch (err) {
        res.status(500).json({ error: "Failed to get images" })
    }
});


// POST items to a category
categoriesRouter.post("/:categoryId/itemCards", async (req, res) => {
    console.log("server reached");
    try {
        const newItem = new ItemCards(req.body);
        const savedItem = await newItem.save();
        
        //In Express, .json() only takes one argument (the data you want to send).
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// DELETE an item from the database
categoriesRouter.delete("/:categoryId/itemCards/:itemId", async (req, res) => {
    try {
        const { itemId } = req.params; // IMPORTANT!!!: Please pay attention to whether it's a function or it's accessing an object's property
        const  userId = req.user.id;
        const deletedItem = await ItemCards.findOneAndDelete({
            _id: itemId, 
            userId: userId  // The 'Lock'
        });

        if (!deletedItem) {
            return res.status(404).json({ error: "Item not found in database" });
        }

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
    console.log("server reached");
    try {
        const { itemId } = req.params; // IMPORTANT!!!: Please pay attention to whether it's a function or it's accessing an object's property
        let newData = { ...req.body };

        // RUN THIS FIRST so user changes hit MongoDB instantly (Takes ~10ms)
        const savedItem = await ItemCards.findByIdAndUpdate(
            itemId, 
            { $set: newData }, // $set updates only the fields sent in req.body
            { returnDocument: 'after', runValidators: true } // 'new: true' returns the modified document
        );

        if (!savedItem) {
            return res.status(404).json({ error: "Item not found in database" });
        }

        try {
            const geminiParagraph = await geminiService.generateItemContent({ 
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
        
        // // findByIdAndUpdate takes: 1. The ID, 2. The new data, 3. Options
        // const savedItem = await ItemCards.findByIdAndUpdate(
        //     itemId, 
        //     { $set: newData }, // $set updates only the fields sent in req.body
        //     { returnDocument: 'after', runValidators: true } // 'new: true' returns the modified document
        // );

        // if (!savedItem) {
        //     return res.status(404).json({ error: "Item not found in database" });
        // }

        // Upload this item's information to the index in Pipecone
        await vectorService.upsertItemCard(savedItem)

        console.log("Item saved successfully");
    } catch (err) {
        console.error("Item save error: ", err);
        res.status(500).json({ err: err.message });
    }
});

export default categoriesRouter;