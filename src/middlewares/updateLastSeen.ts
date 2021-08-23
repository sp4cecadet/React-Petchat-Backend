import { Request, Response, NextFunction } from "express";

import { UserModel } from "../models";

export default (req: Request, res: Response, next: NextFunction) => {
  const userId = "61220551201ec70700ecfd02";
  UserModel.findOneAndUpdate(
    {
      _id: userId,
    },
    { fullname: "Galen Erso", last_seen: new Date() },
    {
      new: true,
    },
    () => {}
  );
  next();
};
