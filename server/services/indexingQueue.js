import { Queue, createNodeRedisClient} from "bullmq";
import redisClient from "./redisClient.js";

// Adapt the existing client for BullMQ.
const connection = createNodeRedisClient(redisClient);

export const indexingQueue = new Queue("indexing-items", { connection });
