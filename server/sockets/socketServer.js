import { Server } from "socket.io";

let io; 

export const initializeSocket = (httpServer, allowedOrigins) => {
    io = new Server(httpServer, {         // Attach Socket.IO engine to the shared HTTP server
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
        connectionStateRecovery: {},
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    return io;
};


export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
};