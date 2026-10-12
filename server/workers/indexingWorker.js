import { Worker, createNodeRedisClient} from "bullmq";
import { emitProgress } from "../sockets/socketProgress.js";
import { geminiService } from "../services/geminiService.js";
import { vectorService } from "../services/vectorStore.js";
import mongoose from "mongoose";
import redisClient from "../services/redisClient.js";
import ItemCards from "../models/itemCardsModel.js";

// Connect to MongoDB before worker starts claiming jobs
await mongoose.connect(process.env.MONGO_URI);

// Adapt the existing client for BullMQ.
const connection = createNodeRedisClient(redisClient);

// IMPORTANT!!!!: Don't hide failures from BullMQ, let the processor know there is an error inside it
const processIndex = async (job) => {
    try {
        // Load the current item owned by this user.
        const item = await ItemCards.findOne({ _id: job.data.itemId, userId: job.data.userId });

        // Skip an item deleted before processing began.
        if (!item) return "Item no longer exists";

        // Genarate gemini's description for this item
        const geminiParagraph = await geminiService.generateItemContent({
            file: item.file,
            brand: item.brand,
            notes: item.notes,
            url: item.url,
            description: item.description
        })

        console.log(geminiParagraph)

        // Add the newly created paragraph to the Item
        item.geminiDescription = geminiParagraph;

        // WebSocket - 3rd phase
        // emitProgress(userId, "save-status", "Saving item's description");

        // Save the newly updated item with gemini description to mongodb
        await item.save();

        // Save 
        await vectorService.upsertItemCard(item);

        // WebSocket - 5th phase
        // emitProgress(userId, "save-status", "Done!");
    } catch (error) {
        console.error(`Indexing failed, here is the error: ${error}`);
        throw error;
    }
}


// Process jobs from the matching queue
const worker = new Worker("indexing-items", async job => {
    // Print the claimed job and this worker process's ID.
    console.log(`Claimed job ${job.id}; worker PID ${process.pid}`);

    // Start processing the work
    await processIndex(job);

    // Resolve the processor with a result.
    return `Indexed item ${job.data.itemId}`;
}, { connection, concurrency: 1 });


// Observe a successfully completed job.
worker.on("completed", (job, result) => {
    console.log(result);
});

// Observe a failed job.
worker.on("failed", (job, error) => {
    console.log(`Failed: ${error.message}`);
});

// Observe worker-level errors such as connection problems.
worker.on("error", error => {
    console.error(error.message);
});