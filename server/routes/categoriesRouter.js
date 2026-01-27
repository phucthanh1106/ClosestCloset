import Categories from "../models/categories.js"
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
        const category = new Categories(req.body);
        const savedCategory = await category.save();

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
        console.log("Delete request received for ID:", req.params.id);
        const { id } = req.params;

        const deletedCategory = await Categories.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ error: "Category not found in database" });
        } 

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Delete error: ", error);
        res.status(500).json({ error: err.message });
    }
});

export default categoriesRouter;