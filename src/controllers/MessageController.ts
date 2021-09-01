import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ObjectId } from "mongoose";
import socket from "socket.io";
import { DialogModel, MessageModel } from "../models/";
import { IDialog } from "../models/Dialog";
import { IMessage } from "../models/Message";
import { IUser } from "../models/User";
import { RequestUserExtended } from "../types";

class MessageController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  updateReadStatus = (
    res: Response,
    senderId: IUser["_id"] | string,
    dialogId: IDialog["_id"]
  ): void => {
    MessageModel.updateMany(
      { dialog: dialogId, sender: { $ne: senderId } },
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
      .populate(["dialog", "attachments"])
      .populate({ path: "sender", populate: { path: "avatar" } })
      .exec((err, messages) => {
        if (err) {
          return res.status(404).json({
            status: "error",
            message: "Нет сообщений",
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

    message
      .save()
      .then((obj: IMessage) => {
        obj.populate(
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
