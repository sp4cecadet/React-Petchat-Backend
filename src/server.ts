import express from "express";
import mongoose from "mongoose";

import {
  UserController,
  DialogController,
  MessageController,
} from "./controllers/";

const bodyParser = require("body-parser");

import { updateLastSeen, checkAuth } from "./middlewares/";
import { LoginValidation, RegisterValidation } from "./utils/validations";

const app = express();

const User = new UserController();
const Dialog = new DialogController();
const Message = new MessageController();

require("dotenv").config();

app.use(bodyParser.json());
app.use(updateLastSeen);
app.use(checkAuth);

mongoose.connect(
  "mongodb://localhost:27017/" + process.env.DBNAME,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  () => {
    console.log("[MONGODB]:", process.env.DBNAME, "AIR");
  }
);

// User requests block
app.get("/user/me", User.getMe);
app.get("/user/find", User.findUsers);
app.get("/user/:id", User.index);
app.get("/verify", User.verify);
app.post("/signup", RegisterValidation, User.register);
app.post("/signin", LoginValidation, User.login);
app.delete("/user/:id", User.delete);
// =====================

// Dialog requests block
app.get("/dialogs", Dialog.index);
app.post("/dialog", Dialog.create);
app.delete("/dialog/:id", Dialog.delete);
// =====================

// Message requests block
app.get("/messages/:id", Message.index);
app.post("/message", Message.create);
app.delete("/message/:id", Message.delete);
// =====================

app.listen(process.env.PORT, () => {
  console.log("[SERVER]: AIR at", process.env.PORT);
});
