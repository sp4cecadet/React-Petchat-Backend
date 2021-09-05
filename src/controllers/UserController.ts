import express, { ErrorRequestHandler, Request, Response } from "express";
import { ParsedQs } from "qs";

import { validationResult, Result, ValidationError } from "express-validator";
import bcrypt from "bcrypt";
import { SentMessageInfo } from "nodemailer/lib/sendmail-transport";
import socket from "socket.io";

import { UserModel } from "../models/";
import { IUser } from "../models/User";
import { createJWToken, checkIfEmailUsed } from "../utils/";
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
      .populate("avatar")
      .then((user: IUser | null) => {
        res.json(user);
      })
      .catch(() => {
        res.status(404).json({ message: "Пользователь не найден" });
      });
  }

  getMe(req: RequestUserExtended, res: Response) {
    const id: string = req.user._id;
    UserModel.findById(id, { password: 0, confirm_hash: 0 })
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
    query &&
      UserModel.find()
        .or([{ fullname: new RegExp(query, "i") }])
        .then((users: IUser[]) => {
          res.json(users);
        })
        .catch((err) => {
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

    checkIfEmailUsed(postData.email).then((exists) => {
      if (exists) {
        res.json({ status: "exists", message: "E-mail уже используется" });
      } else {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          res.status(422).json({ errors: errors.array() });
        } else {
          const user = new UserModel(postData);

          user
            .save()
            .then((obj: IUser) => {
              res.status(201).json(obj);
              mailer.sendMail(
                {
                  from: {
                    name: "React Petchat",
                    address: "react.petchat.mailer@gmail.com",
                  },
                  to: postData.email,
                  subject: "Подтверждение регистрации в React Petchat",
                  html: `Для того, чтобы подтвердить почту, перейдите <a href="http://${process.env.HOSTNAME}:3000/user/verify?hash=${obj.confirm_hash}">по этой ссылке</a>`,
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
    });
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
      UserModel.findOne(
        { email: postData.email },
        (err: ErrorRequestHandler, user: IUser) => {
          if (err || !user) {
            return res.status(404).json({
              message: "Пользователь не найден",
            });
          }

          if (bcrypt.compareSync(postData.password, user.password)) {
            const token = createJWToken(user);
            res.status(200).json({
              status: "success",
              token,
            });
          } else {
            res.status(403).json({
              status: "error",
              message: "Неправильный e-mail или пароль",
            });
          }
        }
      );
    }
  }

  verify(req: Request, res: Response) {
    const hash: ParsedQs = req.query.hash as ParsedQs;
    if (!hash) {
      res
        .status(422)
        .json({ errors: "Неправильнная ссылка для подтверждения" });
    } else {
      UserModel.findOne(
        { confirm_hash: hash },
        (err: ErrorRequestHandler, user: IUser) => {
          if (err || !user) {
            return res.status(404).json({
              status: "error",
              message: "Неправильная ссылка для подтверждения",
            });
          }
          if (user.confirmed && user.confirmed === true) {
            return res.status(200).json({
              status: "verified",
              message: "Аккаунт уже был подтверждён",
            });
          } else {
            user.confirmed = true;
            user.save((err) => {
              if (err) {
                return res.status(404).json({
                  status: "error",
                  message: err,
                });
              }

              res.status(200).json({
                status: "success",
                message: "Аккаунт успешно подтвержден!",
              });
            });
          }
        }
      );
    }
  }
}

export default UserController;
