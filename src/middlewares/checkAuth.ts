import { Request, Response, NextFunction } from "express";

import { IUser } from "../models/User";
import { verifyJWTToken } from "../utils";

interface CustomRequest extends Request {
  user?: IUser;
}

export default (req: Request, res: Response, next: NextFunction): void => {
  if (
    req.path === "/signin" ||
    req.path === "/signup" ||
    req.path === "/verify"
  ) {
    return next();
  }

  const token: string | null =
    "token" in req.headers ? (req.headers.token as string) : null;

  if (token) {
    verifyJWTToken(token)
      .then((user: any) => {
        if (user) {
          req.user = user.data._doc;
          next();
        }
      })
      .catch(() => {
        res
          .status(403)
          .json({ message: "Ошибка токена. Попробуйте очистить cookies." });
      });
  } else {
    res.status(403).json({
      status: "error",
      message: "Ошибка токена. Попробуйте очистить cookies.",
    });
  }
};
