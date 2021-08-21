import { Request, Response } from "express";

import express from "express";
import mongoose from "mongoose";

import { UserModel } from "./schemas/";
import { UserController } from "./controllers/";

const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const DBNAME = "chat";

const User = new UserController();

app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/" + DBNAME, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User requests block
app.get("/:id", User.index);
app.post("/register", User.register);
app.delete("/:id", User.delete);
// =====================

app.listen(PORT, () => {
  console.log("[SERVER]: AIR at", PORT);
});
