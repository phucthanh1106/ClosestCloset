import { Server } from "socket.io";
import cookie from "cookie"; 
import jwt from "jsonwebtoken";

let io; 

export const initializeSocket = (httpServer, allowedOrigins) => {
    io = new Server(httpServer, {         // Attach Socket.IO engine to the shared HTTP server
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000,
            skipMiddlewares: false,
        },
    });

    // Socket.IO Authentication Middleware
    io.use((socket, next) => {
        try {
            // 1. Extract raw cookie string from HTTP handshake headers
            const rawCookies = socket.request.headers.cookie;

            if (!rawCookies) {
                return next(new Error("Authentication failed: No cookies found"));
            }

            // 2. Parse cookie string into a JS object
            const parsedCookies = cookie.parse(rawCookies);
            
            const token = parsedCookies.token;

            if (!token) {
                return next(new Error("Authentication failed: Auth token missing"));
            }

            // 3. Verify JWT token
            const decoded = jwt.verify(token, process.env.SECRET);

            // 4. Attach authenticated user details directly to the socket instance
            socket.user = decoded; 

            next(); // Auth successful - allow connection to proceed
        } catch (err) {
            console.error("[Socket Auth Error]:", err.message);
            return next(new Error("Authentication failed: Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        const room = `user:${socket.user._id}`;

        socket.join(room);

        console.log("Socket connected:", socket.id, room);

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", socket.id, reason);
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

