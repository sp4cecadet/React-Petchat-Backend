import { createServer } from "http";
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import { Response, Request } from "express";
import createRoutes from "./core/routes";
import createSocket from "./core/socket";

dotenv.config();

const express = require("express");
const app = express();
const http = createServer(app);
export const io = createSocket(http);

const favicon = require("express-favicon");

const root = path.join(path.resolve(), "client/build");

app.use(express.static(root));
app.use(express.static(path.resolve()));
app.use(favicon(path.join(root, "favicon.png")));

createRoutes(app, io);

app.get("/*", (res: Response) => {
  res.sendFile("index.html", { root });
});

process.env.MONGODB_URL &&
  mongoose.connect(
    process.env.MONGODB_URL,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) console.log("[MONGODB]:", err);
      else console.log("[MONGODB]:", "AIR");
    }
  );

http.listen(process.env.PORT, () => {
  console.log("[SERVER]: AIR at", process.env.PORT);
});
