import { Request, Response } from "express";

import { UserModel } from "../schemas/";
import { IUser } from "../schemas/User";

class UserController {
  index(req: Request, res: Response) {
    const id: string = req.params.id;
    UserModel.findById(id)
      .then((user: IUser | null) => {
        res.json(user);
      })
      .catch(() => {
        res.status(404).json({ message: "Пользователь не найден" });
      });
  }

  getMe() {
    //
  }

  register(req: Request, res: Response) {
    const postData = {
      email: req.body.email,
      fullname: req.body.fullname,
      password: req.body.password,
    };

    const user = new UserModel(postData);

    user
      .save()
      .then((obj: { [key: string]: any }) => {
        return res.json(obj);
      })
      .catch((err: { [key: string]: any }) => res.json(err.message));
  }

  delete(req: Request, res: Response) {
    const id: string = req.params.id;
    UserModel.findByIdAndRemove(id)
      .then(() => {
        res.json({ message: "Пользователь был удалён" });
      })
      .catch(() => {
        res.status(404).json({ message: "Пользователь не найден" });
      });
  }
}

export default UserController;
