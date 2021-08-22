import mongoose, { Schema, Document } from "mongoose";

export interface IDialog extends Document {
  author: {
    type: Schema.Types.ObjectId;
    ref: "User";
  };
  partner: {
    type: Schema.Types.ObjectId;
    ref: "User";
  };
  messages: [
    {
      type: Schema.Types.ObjectId;
      ref: string;
    }
  ];
}

const DialogSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    partner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: [{ type: Schema.Types.ObjectId, ref: String }],
  },
  {
    timestamps: true,
  }
);

const DialogModel = mongoose.model<IDialog>("Dialog", DialogSchema);

export default DialogModel;
