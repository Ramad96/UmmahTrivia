import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

// Single shared socket instance for the entire app
const socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
});

export default socket;
