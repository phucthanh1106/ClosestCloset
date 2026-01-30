import Categories from "../models/categories.js";
import ItemCards from "../models/itemCards.js";
import express from 'express';

const categoriesRouter = express.Router();

// Returning categories to the dropdown menu
categoriesRouter.get("/", async (req, res) => {
    try {
        const categories = await Categories.find().sort({ name: 1});
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// Adding new category to the dropdown menu
categoriesRouter.post("/", async (req, res) => {
    try {
        const newCategory = new Categories(req.body);
        const savedCategory = await newCategory.save();

        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Deleting a category 
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

// Getting images from a category
categoriesRouter.get("/:categoryId", async (req, res) => {
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


// Adding images to a category
categoriesRouter.post("/:categoryId", async (req, res) => {
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


// Deleting an image from the database
categoriesRouter.delete("/:categoryId/:itemId", async (req, res) => {
    try {
        const { itemId } = req.params; // IMPORTANT!!!: Please pay attention to whether it's a function or it's accessing an object's property

        const deletedItem = await ItemCards.findByIdAndDelete(itemId);

        if (!deletedItem) {
            return res.status(404).json({ error: "Item not found in database" });
        }

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        console.error("Item delete error: ", err);
        res.status(500).json({ err: err.message });
    }
});


// Saving an image's form
// IMPORTANT!!!: PUT is for updating information
categoriesRouter.put("/:categoryId/:itemId", async (req, res) => {
    console.log("server reached");
    try {
        const { itemId } = req.params; // IMPORTANT!!!: Please pay attention to whether it's a function or it's accessing an object's property
        
        // findByIdAndUpdate takes: 1. The ID, 2. The new data, 3. Options
        const savedItem = await ItemCards.findByIdAndUpdate(
            itemId, 
            { $set: req.body }, // $set updates only the fields sent in req.body
            { new: true, runValidators: true } // 'new: true' returns the modified document
        );

        if (!savedItem) {
            return res.status(404).json({ error: "Item not found in database" });
        }

        res.status(200).json({ message: "Item saved successfully" });
    } catch (err) {
        console.error("Item save error: ", err);
        res.status(500).json({ err: err.message });
    }
});

export default categoriesRouter;