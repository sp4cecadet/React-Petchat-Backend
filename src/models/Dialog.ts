import mongoose, { Schema, Document } from "mongoose";
import { IMessage } from "./Message";

export interface IDialog extends Document {
  author: {
    type: Schema.Types.ObjectId;
    ref: "User";
  };
  partner: {
    type: Schema.Types.ObjectId;
    ref: "User";
  };
  messages: IMessage[];
  lastMessage: IMessage | string | undefined;
}

const DialogSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    partner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: Array,
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  {
    timestamps: true,
  }
);

const DialogModel = mongoose.model<IDialog>("Dialog", DialogSchema);

export default DialogModel;
