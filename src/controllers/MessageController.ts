import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ObjectId } from "mongoose";
import socket from "socket.io";
import { DialogModel, MessageModel } from "../models/";
import { IDialog } from "../models/Dialog";
import { IMessage } from "../models/Message";
import { RequestUserExtended } from "../types";

class MessageController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  updateReadStatus = (
    res: Response,
    senderId: ObjectId | string,
    dialogId: IDialog["_id"]
  ): void => {
    MessageModel.updateMany(
      { dialog: dialogId, user: { $ne: senderId } },
      { $set: { readed: true } }
    )
      .then(() => {
        this.io.emit("SERVER:MESSAGES_READED", {
          senderId,
          dialogId,
        });
      })
      .catch((err) => {
        console.log("readstatus[ERROR]: ", err);
        res.status(500).json({
          status: "error",
          message: err,
        });
      });
  };

  index = (req: Request, res: Response): void => {
    const dialogId: IDialog["_id"] = req.query.dialog;
    const senderId: ObjectId | string = req.user._id;

    this.updateReadStatus(res, senderId, dialogId);

    MessageModel.find({ dialog: dialogId })
      .populate(["dialog", "sender", "attachments"])
      .exec((err, messages) => {
        if (err) {
          return res.status(404).json({
            status: "error",
            message: "Messages not found",
          });
        }
        res.json(messages);
      });
  };

  create = (req: Request, res: Response): void => {
    const userId: string = req.user._id;
    const postData = {
      text: req.body.text,
      dialog: req.body.dialog_id,
      attachments: req.body.attachments,
      sender: userId,
    };

    const message = new MessageModel(postData);
    // this.updateReadStatus(res, userId, req.body.dialog_id);

    message
      .save()
      .then((obj: IMessage) => {
        obj.populate("sender", (err: any, message: IMessage) => {
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
          this.io.emit("SERVER:NEW_MESSAGE", message);
        });
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
        message
          .remove()
          .catch((err) => res.json({ message: "error", err: err.message }));

        MessageModel.findOne(
          { dialog: dialogId },
          {},
          { sort: { created_at: -1 } },
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

                dialog.lastMessage = lastMessage || undefined;
                dialog
                  .save()
                  .catch((err) =>
                    res.json({ message: "error", err: err.message })
                  );

                res.json({
                  status: "success",
                  message: "Сообщение было удалено",
                });

                this.io.emit("SERVER:MESSAGE_REMOVED");
              }
            );
          }
        );
      } else {
        return res.status(403).json({
          status: "error",
          message: "Not have permission",
        });
      }
    });
  };
}

export default MessageController;
