import express from "express";
import mongoose from "mongoose";

import {
  UserController,
  DialogController,
  MessageController,
} from "./controllers/";

const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const DBNAME = "chat";

const User = new UserController();
const Dialog = new DialogController();
const Message = new MessageController();

app.use(bodyParser.json());

mongoose.connect(
  "mongodb://localhost:27017/" + DBNAME,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  () => {
    console.log("[MONGODB]:", DBNAME, "AIR");
  }
);

// User requests block
app.get("/user/:id", User.index);
app.post("/user/register", User.register);
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

app.listen(PORT, () => {
  console.log("[SERVER]: AIR at", PORT);
});
