import { io } from "socket.io-client";
import { API_BASE_URL } from "../config.js";

const socketURL = API_BASE_URL || "http://localhost:4000";

const socket = io(socketURL, {
    withCredentials: true,
    autoConnect: false, // prevents from attempting a connection before logging in
    reconnection: true, // enables automatic recovery
});

socket.on("connect", () => {
    console.log("Client connected:", socket.id);
});

socket.on("connect_error", error => {
    console.error("Socket connection failed:", error.message);
});

socket.on("disconnect", reason => {
    console.warn("Socket disconnected:", reason);
});

socket.io.on("reconnect_attempt", attempt => {
    console.log("Socket reconnect attempt:", attempt);
});

export default socket;