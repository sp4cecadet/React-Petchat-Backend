import { Request, Response } from "express";
import { MessageModel } from "../models/";
import { IMessage } from "../models/Message";

class MessageController {
  index(req: Request, res: Response) {
    const dialogId: any = req.params.id;

    MessageModel.find({ dialog: dialogId })
      .populate(["dialog"])
      .then((dialog: IMessage[] | null) => {
        res.json(dialog);
      })
      .catch((err) => {
        res.status(404).json({ message: "Нет сообщений" });
      });
  }

  create(req: Request, res: Response) {
    const userId = "61220551201ec70700ecfd02";

    const postData = {
      text: req.body.text,
      sender: userId,
      dialog: req.body.dialog,
    };

    const message = new MessageModel(postData);

    message
      .save()
      .then((message: { [key: string]: any }) => {
        return res.json(message);
      })
      .catch((err: { [key: string]: any }) => res.json(err.message));
  }

  delete(req: Request, res: Response) {
    const id: string = req.params.id;
    MessageModel.findByIdAndRemove(id)
      .then(() => {
        res.json({ message: "Сообщение было удалёно" });
      })
      .catch(() => {
        res.status(404).json({ message: "Сообщение не найдено" });
      });
  }
}

export default MessageController;
