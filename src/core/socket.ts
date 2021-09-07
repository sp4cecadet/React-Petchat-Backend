import http from "http";
import { IDialog } from "../models/Dialog";
import { Socket } from "socket.io";

export default (http: http.Server) => {
  const io = require("socket.io")(http, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on(
      "DIALOGS:JOIN",
      (currentDialogId: string, newDialogId: string) => {
        socket.leave(currentDialogId);
        socket.join(newDialogId);
      }
    );
    socket.on("KEYBOARD:KEY_PRESSED", ({ dialogId }: IDialog["_id"]) => {
      socket.broadcast.volatile.to(dialogId).emit("DIALOGS:TYPING");
    });
  });

  return io;
};
