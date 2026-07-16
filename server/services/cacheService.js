import redisClient from "./redisClient.js";

// CHANGE: GET CACHE WITHOUT CRASHING THE REQUEST
export const getCache = async (key) => {
    try {
        const cachedData = await redisClient.get(key);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (err) {
        console.error("Redis GET failed:", err);
        return null;
    }
};

// CHANGE: SET CACHE WITHOUT CRASHING THE REQUEST
export const setCache = async (key, value, seconds = 600) => {
    try {
        await redisClient.set(key, JSON.stringify(value), { EX: seconds });
    } catch (err) {
        console.error("Redis SET failed:", err);
    }
};

// CHANGE: DELETE CACHE WITHOUT CRASHING THE REQUEST
export const deleteCache = async (key) => {
    try {
        await redisClient.del(key);
    } catch (err) {
        console.error("Redis DEL failed:", err);
    }
};