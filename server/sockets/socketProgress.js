import { getIO } from "../sockets/socketServer.js";

export const emitProgress = (userId, event, status) => {
    getIO().to(`user:${userId}`).emit(event, status);
};