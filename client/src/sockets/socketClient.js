import { io } from "socket.io-client";
import { API_BASE_URL } from "../config.js";

const socketURL = API_BASE_URL || "http://localhost:4000";

const socket = io(socketURL, {
    withCredentials: true,
});

socket.on("connect", () => {
    console.log("Client connected:", socket.id);
});

export default socket;