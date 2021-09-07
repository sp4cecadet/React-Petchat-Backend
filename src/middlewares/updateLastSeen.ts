import express from "express";
import { UserModel } from "../models";

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.user) {
    UserModel.findOneAndUpdate(
      { _id: req.user._id },
      {
        last_seen: new Date(),
      },
      {},
      (err) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: err,
          });
        }
      }
    );
  }
  next();
};
