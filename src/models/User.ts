import mongoose, { Schema, Document } from "mongoose";
import isEmail from "validator/lib/isEmail";
import { generatePasswordHash } from "../utils";
import differenceInMinutes from "date-fns/differenceInMinutes";
import { ThisTypeNode, ThisTypePredicate } from "typescript";

export interface IUser extends Document {
  email: string;
  fullname: string;
  password: string;
  confirmed: boolean;
  confirm_hash?: string;
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
    last_seen: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.virtual("isOnline").get(function (this: IUser) {
  return differenceInMinutes(new Date(), this.last_seen) < 5;
});

UserSchema.set("toJSON", {
  virtuals: true,
});

UserSchema.pre<IUser>("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  user.password = await generatePasswordHash(user.password);
  user.confirm_hash = await generatePasswordHash(new Date().toString());
});

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
