import express, { Request, Response } from "express";
import { validationResult, Result, ValidationError } from "express-validator";
import bcrypt from "bcrypt";
import { SentMessageInfo } from "nodemailer/lib/sendmail-transport";
import socket from "socket.io";

import { UserModel } from "../models/";
import { IUser } from "../models/User";
import { createJWToken } from "../utils/";
import mailer from "../core/mailer";
import { RequestUserExtended } from "../types";

class UserController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

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

  getMe(req: RequestUserExtended, res: Response) {
    const id: string = req.user._id;
    UserModel.findById(id)
      .then((user: IUser | null) => {
        res.json(user);
      })
      .catch(() =>
        res.status(404).json({
          message: "Пользователь не найден",
        })
      );
  }

  findUsers = (req: Request, res: Response): void => {
    const query: any = req.query.query;
    UserModel.find()
      .or([
        { fullname: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ])
      .then((users: IUser[]) => res.json(users))
      .catch((err: any) => {
        return res.status(404).json({
          status: "error",
          message: err,
        });
      });
  };

  register(req: Request, res: Response) {
    const postData: { email: string; fullname: string; password: string } = {
      email: req.body.email,
      fullname: req.body.fullname,
      password: req.body.password,
    };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      const user = new UserModel(postData);

      user
        .save()
        .then((obj: IUser) => {
          res.json(obj);
          mailer.sendMail(
            {
              from: "admin@test.com",
              to: postData.email,
              subject: "Подтверждение почты React Chat Tutorial",
              html: `Для того, чтобы подтвердить почту, перейдите <a href="http://localhost:3003/verify?hash=${obj.confirm_hash}">по этой ссылке</a>`,
            },
            function (err: Error | null, info: SentMessageInfo) {
              if (err) {
                console.log(err);
              }
            }
          );
        })
        .catch((reason) => {
          res.status(500).json({
            status: "error",
            message: reason,
          });
        });
    }
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

  login(req: Request, res: Response) {
    const postData: { email: string; password: string } = {
      email: req.body.email,
      password: req.body.password,
    };

    const errors: Result<ValidationError> = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      UserModel.findOne({ email: postData.email }, (err: any, user: IUser) => {
        if (err || !user) {
          return res.status(404).json({
            message: "Пользователь не найден",
          });
        }

        if (bcrypt.compareSync(postData.password, user.password)) {
          const token = createJWToken(user);
          res.json({
            status: "success",
            token,
          });
        } else {
          res.status(403).json({
            status: "error",
            message: "Неправильный e-mail или пароль",
          });
        }
      });
    }
  }

  verify(req: Request, res: Response) {
    const hash: any = req.query.hash;

    if (!hash) {
      res.status(422).json({ errors: "Invalid hash" });
    } else {
      UserModel.findOne({ confirm_hash: hash }, (err: any, user: IUser) => {
        if (err || !user) {
          return res.status(404).json({
            status: "error",
            message: "Hash not found",
          });
        }
        if (user.confirmed === true) {
          res.json({
            status: "success",
            message: "Аккаунт уже был подтверждён",
          });
        } else {
          user.confirmed = true;
          user.save((err: any) => {
            if (err) {
              return res.status(404).json({
                status: "error",
                message: err,
              });
            }

            res.json({
              status: "success",
              message: "Аккаунт успешно подтвержден!",
            });
          });
        }
      });
    }
  }
}

export default UserController;
