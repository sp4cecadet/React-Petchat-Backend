import { Request } from "express";
import { IUser } from "./src/models/User";

export interface RequestUserExtended extends Request {
  user?: IUser;
}
