const { Router } = require("express");

const categoriesRouter = Router();

categoriesRouter.get("/", (req, res) => {
    res.send("Categories route is working!");
});

categoriesRouter.get("/:categoryName", (req, res) => {
    const { categoryName } = req.params;
    res.send(`You requested the category: ${categoryName}`);
});

export default categoriesRouter;