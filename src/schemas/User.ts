import mongoose, { Schema, Document } from "mongoose";
import isEmail from "validator/lib/isEmail";

export interface IUser extends Document {
  email: string;
  fullname: string;
  password: string;
  confirmed: boolean;
  confirm_hash: string;
  avatar?: string;
  last_seen: Date;
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: "Укажите адрес электронной почты",
      validate: [isEmail, "Адрес электронной почты должен быть указан верно"],
      unique: true,
    },
    avatar: String,
    fullname: {
      type: String,
      required: "Необходимо ввести имя",
    },
    password: {
      type: String,
      required: "Необходимо ввести пароль",
    },
    confirmed: {
      type: String,
      default: false,
    },
    confirm_hash: {
      type: String,
    },
    last_seen: Date,
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
