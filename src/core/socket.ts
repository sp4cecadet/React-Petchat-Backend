import http from "http";
import { Socket } from "socket.io";

import { IDialog } from "../models/Dialog";
import { IUser } from "../models/User";
import { updateMessagesStatus } from "../middlewares";

export default (http: http.Server) => {
  const io = require("socket.io")(http, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on(
      "DIALOGS:JOIN",
      (
        userId: IUser["_id"],
        currentDialogId: IDialog["_id"],
        newDialogId: IDialog["_id"]
      ) => {
        socket.leave(currentDialogId);
        socket.join(newDialogId);
        updateMessagesStatus(userId, newDialogId);
      }
    );
    socket.on("KEYBOARD:KEY_PRESSED", ({ dialogId }: IDialog["_id"]) => {
      socket.broadcast.to(dialogId).emit("DIALOGS:TYPING");
    });

    socket.on("MESSAGES:FETCHED", ({ userId, dialogId }) => {
      updateMessagesStatus(userId, dialogId);

      socket.broadcast.volatile.to(dialogId).emit("SERVER:MESSAGES_READED");
    });
  });

  return io;
};
