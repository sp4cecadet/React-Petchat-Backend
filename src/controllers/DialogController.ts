import { Request, Response } from "express";
import { Schema, FilterQuery } from "mongoose";

import { DialogModel, MessageModel } from "../models/";
import { IDialog } from "../models/Dialog";

class DialogController {
  index(req: Request, res: Response) {
    const authorId: any = "61220551201ec70700ecfd02";

    DialogModel.find({ author: authorId })
      .populate(["author", "partner"])
      .then((dialog: IDialog[] | null) => {
        res.json(dialog);
      })
      .catch(() => {
        res.status(404).json({ message: "Диалог не найден" });
      });
  }

  create(req: Request, res: Response) {
    const postData = {
      author: req.body.author,
      partner: req.body.partner,
    };

    const dialog = new DialogModel(postData);

    dialog
      .save()
      .then((dialog: { [key: string]: any }) => {
        const message = new MessageModel({
          text: req.body.text,
          sender: req.body.sender,
          dialog: dialog._id,
        });

        message
          .save()
          .then((message: any) => {
            res.json({
              dialog: dialog,
              message: message,
            });
          })
          .catch((err: { [key: string]: any }) => res.json(err.message));
      })
      .catch((err: { [key: string]: any }) => res.json(err.message));
  }

  delete(req: Request, res: Response) {
    const id: string = req.params.id;
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
