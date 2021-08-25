import bodyParser from "body-parser";
import { Express, NextFunction, Request, Response } from "express";
import socket from "socket.io";
import cors from "cors";

import { checkAuth, updateLastSeen } from "../middlewares";
import {
  UserController,
  DialogController,
  MessageController,
  UploadController,
} from "../controllers/";
import { LoginValidation, RegisterValidation } from "../utils/validations";

import multer from "./multer";

const createRoutes = (app: Express, io: socket.Server) => {
  const User = new UserController(io);
  const Dialog = new DialogController(io);
  const Message = new MessageController(io);
  const File = new UploadController();

  app.get("/", (req: Request, res: Response) => {
    res.send({});
  });

  app.use(bodyParser.json());
  app.use(checkAuth);
  app.use(updateLastSeen);

  app.use(
    cors({
      origin: "http://cors-anywhere.herokuapp.com/",
      credentials: true,
    })
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
  app.delete("/dialog", Dialog.delete);
  // =====================

  // Message requests block
  app.get("/messages", Message.index);
  app.post("/message", Message.create);
  app.delete("/message", Message.delete);
  // =====================

  // Files requests block
  app.post("/files", multer.single("file"), File.create);
  app.delete("/files", File.delete);
  // =====================
};

export default createRoutes;
