import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/types";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
