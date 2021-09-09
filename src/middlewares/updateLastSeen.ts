import express from "express";
import { UserModel } from "../models";
import { RequestUserExtended } from "../types";

export default (
  req: RequestUserExtended,
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
