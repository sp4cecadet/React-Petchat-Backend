import { IDialog } from "../models/Dialog";
import { IUser } from "../models/User";
import { MessageModel } from "../models/";

export default (userId: IUser["_id"], dialogId: IDialog["_id"]): void => {
  MessageModel.updateMany(
    { dialog: dialogId, sender: { $ne: userId } },
    { $set: { readed: true } }
  ).catch((err) => console.error(err));
};
