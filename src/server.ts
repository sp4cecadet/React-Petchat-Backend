import express, { NextFunction, Response } from "express";
import { createServer } from "http";
import mongoose from "mongoose";

import dotenv from "dotenv";

import createRoutes from "./core/routes";
import createSocket from "./core/socket";

dotenv.config();

const app = express();
const http = createServer(app);
const io = createSocket(http);

createRoutes(app, io);

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

http.listen(process.env.PORT, () => {
  console.log("[SERVER]: AIR at", process.env.PORT);
});
