import { IDialog } from "../models/Dialog";
import { IUser } from "../models/User";
import { MessageModel } from "../models/";

export default async (userId: IUser["_id"], dialogId: IDialog["_id"]) => {
  await MessageModel.updateMany(
    { dialog: dialogId, user: { $ne: userId } },
    { $set: { readed: true } }
  );
};
