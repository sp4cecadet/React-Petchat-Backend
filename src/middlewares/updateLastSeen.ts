import { Response, NextFunction } from "express";

import { UserModel } from "../models";
import { RequestUserExtended } from "../types";

export default (
  req: RequestUserExtended,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    UserModel.findOneAndUpdate(
      { _id: req.user.id },
      {
        last_seen: new Date(),
      },
      { new: true }
    );
  }
  next();
};
