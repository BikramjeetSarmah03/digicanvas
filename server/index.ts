import { createServer } from "http";
import express from "express";
import next, { NextApiHandler } from "next";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "@/types";

const PORT = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app = express();
  const server = createServer(app);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>();

  app.get("/health", (req, res) => {
    res.send("Server is healthy");
  });

  io.on("connection", (socket) => {
    console.log("Connection");

    socket.on("draw", (moves, options) => {
      console.log("Drawing");
      socket.broadcast.emit("socket_draw", moves, options);
    });

    socket.on("disconnect", () => {
      console.log("client disconnected");
    });
  });

  app.all("*", (req: any, res: any) => nextHandler(req, res));

  server.listen(PORT, () => {
    console.log("Server is running");
  });
});
