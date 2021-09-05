import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { IMessage } from "./Message";

export interface IUploadFile extends Document {
  filename: string;
  size: number;
  ext: string;
  duration: number;
  url: string;
  message: IMessage | string;
  user: IUser | string;
}

export type IUploadFileDocument = Document & IUploadFile;

const UploadFileSchema = new Schema(
  {
    filename: String,
    size: Number,
    ext: String,
    duration: Number,
    url: String,
    message: { type: Schema.Types.ObjectId, ref: "Message", require: true },
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
  },
  {
    timestamps: true,
  }
);

const UploadFileModel = mongoose.model<IUploadFileDocument>(
  "File",
  UploadFileSchema
);

export default UploadFileModel;
