import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  text: String;
  readed: Boolean;
  sender: Schema.Types.ObjectId;
  dialog: {
    type: Schema.Types.ObjectId;
    ref: "Dialog";
  };
}

const MessageSchema = new Schema(
  {
    text: { type: String },
    readed: { type: Boolean, required: true, default: false },
    dialog: {
      type: Schema.Types.ObjectId,
      ref: "Dialog",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // attachments:
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);

export default MessageModel;
