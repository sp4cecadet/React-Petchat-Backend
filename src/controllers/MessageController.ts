import { ErrorRequestHandler, Request, Response } from "express";
import { Schema } from "mongoose";
import socket from "socket.io";
import { DialogModel, MessageModel, UploadFileModel } from "../models/";
import { IDialog } from "../models/Dialog";
import { IMessage } from "../models/Message";
import { RequestUserExtended } from "../types";
import { updateMessagesStatus } from "../middlewares";

class MessageController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  index = (req: RequestUserExtended, res: Response): void => {
    const dialogId: IDialog["_id"] = req.query.dialog;
    const userId = req.user._id;

    MessageModel.find({ dialog: dialogId })
      .populate(["dialog", "attachments"])
      .populate({ path: "sender", populate: { path: "avatar" } })
      .exec((err, messages) => {
        if (err) {
          return res.status(404).json({
            status: "error",
            message: "Нет сообщений",
          });
        }

        updateMessagesStatus(userId, dialogId);

        this.io.emit("SERVER:MESSAGES_READED", {
          userId,
          dialogId,
        });

        res.json(messages);
      });
  };

  create = (req: RequestUserExtended, res: Response): void => {
    const userId: string = req.user._id;
    const postData = {
      text: req.body.text,
      dialog: req.body.dialog_id,
      attachments: req.body.attachments,
      sender: userId,
    };

    const message = new MessageModel(postData);

    message
      .save()
      .then((obj: IMessage) => {
        obj
          .populate("attachments")
          .populate(
            { path: "sender", populate: { path: "avatar" } },
            (err: any, message: IMessage) => {
              if (err) {
                return res.status(500).json({
                  status: "error",
                  message: err,
                });
              }

              DialogModel.findOneAndUpdate(
                { _id: postData.dialog },
                { lastMessage: message._id },
                { upsert: true },
                (err) => {
                  if (err) {
                    return res.status(500).json({
                      status: "error",
                      message: err,
                    });
                  }
                }
              );

              res.json(message);
              updateMessagesStatus(userId, postData.dialog);

              this.io.emit("SERVER:NEW_MESSAGE", message);
            }
          );
      })
      .catch((reason) => {
        res.json(reason);
      });
  };

  delete = (req: RequestUserExtended, res: Response): void => {
    const id = req.query.id;
    const userId: string = req.user._id;

    MessageModel.findById(id, (err: ErrorRequestHandler, message: IMessage) => {
      if (err || !message) {
        return res.status(404).json({
          status: "error",
          message: "Сообщение не найдено",
        });
      }

      if (message.sender.toString() === userId) {
        const dialogId = message.dialog;

        message.attachments &&
          message.attachments.forEach(
            (id: { type: Schema.Types.ObjectId; ref: "File" }) => {
              UploadFileModel.findByIdAndRemove(id).catch((err) =>
                console.log(err)
              );
            }
          );

        message
          .remove()
          .catch((err) => res.json({ message: "error", err: err.message }));

        MessageModel.findOne(
          { dialog: dialogId },
          {},
          { sort: { createdAt: -1 } },
          (err, lastMessage) => {
            if (err) {
              res.status(500).json({
                status: "error",
                message: err,
              });
            }
            DialogModel.findById(
              dialogId,
              (err: ErrorRequestHandler, dialog: IDialog) => {
                if (err) {
                  res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }

                if (!dialog) {
                  return res.status(404).json({
                    status: "Not found",
                    message: err,
                  });
                }

                dialog.lastMessage = lastMessage || null;
                dialog
                  .save()
                  .catch((err) =>
                    res.json({ message: "error", err: err.message })
                  );

                this.io.emit("SERVER:MESSAGE_REMOVED");
                return res.json({
                  status: "success",
                  message: "Сообщение было удалено",
                });
              }
            );
          }
        );
      } else {
        return res.status(403).json({
          status: "error",
          message: "У вас нет прав на выполнение этого действия",
        });
      }
    });
  };
}

export default MessageController;
