import { Request, Response } from "express";
import socket from "socket.io";

import { DialogModel, MessageModel } from "../models/";
import { IDialog } from "../models/Dialog";
import { RequestUserExtended } from "../types";
import { IMessage } from "../models/Message";

class DialogController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  index(req: RequestUserExtended, res: Response) {
    const userId = req.user._id;

    DialogModel.find()
      .or([{ author: userId }, { partner: userId }])
      .populate({
        path: "author",
        select: ["isOnline", "fullname", "last_seen"],
        populate: { path: "avatar" },
      })
      .populate({
        path: "partner",
        select: ["isOnline", "fullname", "last_seen"],
        populate: { path: "avatar" },
      })
      .populate({
        path: "lastMessage",
      })
      .then((dialogs: IDialog[] | null) => {
        res.json(dialogs);
      })
      .catch(() => {
        res.status(404).json({ message: "Нет активных диалогов" });
      });
  }

  create = (req: RequestUserExtended, res: Response) => {
    const postData = {
      author: req.user._id,
      partner: req.body.partner,
    };

    DialogModel.findOne({
      author: req.user._id,
      partner: req.body.partner,
    }).then((dialog: IDialog | null) => {
      if (dialog) {
        return res.status(403).json({
          status: "error",
          message: "Такой диалог уже есть",
        });
      } else {
        const dialog = new DialogModel(postData);

        dialog
          .save()
          .then((dialog: { [key: string]: any }) => {
            const message = new MessageModel({
              text: req.body.text,
              sender: req.user._id,
              dialog: dialog._id,
            });

            message
              .save()
              .then((message: IMessage) => {
                dialog.lastMessage = message._id;
                dialog.save().then(() => {
                  res.json({
                    dialog: dialog,
                    message: message,
                  });
                  this.io.emit("SERVER:DIALOG_CREATED", {
                    ...postData,
                    dialog: dialog,
                  });
                });
              })
              .catch((err: { [key: string]: any }) => res.json(err.message));
          })
          .catch((err: { [key: string]: any }) => res.json(err.message));
      }
    });
  };

  delete(req: Request, res: Response) {
    const id = req.query.id;
    DialogModel.findByIdAndRemove(id)
      .then(() => {
        res.json({ message: "Диалог был удалён" });
      })
      .catch(() => {
        res.status(404).json({ message: "Диалог не найден" });
      });
  }
}

export default DialogController;
