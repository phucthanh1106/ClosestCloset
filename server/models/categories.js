import mongoose from "mongoose";

// Schemda defines the structures
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,  
    },
}, { timestamps: true });

// Models allow us to communicate with database collection
// In other words, schema is just defining the structure but the model will wrap around that structure,
// so that the structure can interact with the database
const Categories = mongoose.model('Categories', categoriesSchema);

export default Categories;