import mongoose from "mongoose";

// Defining the schema
const Schema = mongoose.Schema;

const itemCardSchema = new Schema({
    // Hold the public web URL
    file: {
        type: String,
    },

    // Store the exact storage path (e.g., 'closet-items/171829382_shirt.jpg') 
    // This makes deleting the asset from Firebase later completely effortless!
    filePath: {
        type: String,
        required: true
    },

    category: {
    type: mongoose.Schema.Types.ObjectId, // Tells Mongoose this is a "Link" to another document
    ref: 'Category',                     // Tells Mongoose which Model it's linked to
    required: true                       // Every item MUST belong to a category
    },

    description: {
        type: String,
        default: "",
    },    

    userId: {
        type: String,
        required: true,
    },
    
    brand: String,
    url: String, 
    notes: String,
    hasInfo: Boolean,

    geminiDescription: String
}, { timestamps: true }); 

// Convert to a model to interact with the database
const ItemCards = mongoose.model("itemCards", itemCardSchema);

export default ItemCards;