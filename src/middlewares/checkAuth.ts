import { Response, NextFunction } from "express";

import { RequestUserExtended } from "../types";
import { verifyJWTToken } from "../utils";

export default (
  req: RequestUserExtended,
  res: Response,
  next: NextFunction
): void => {
  if (
    req.path === "/signin" ||
    req.path === "/signup" ||
    req.path === "/user/verify"
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
  }
};
