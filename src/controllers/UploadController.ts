import { Request, Response } from "express";
import { Multer } from "multer";
import cloudinary from "../core/cloudinary";
import { UploadFileModel } from "../models";
import { IUploadFile, IUploadFileDocument } from "../models/UploadFile";
import { RequestUserExtended } from "../types";

class UploadController {
  create = (req: Request, res: Response): void => {
    const userId = req.user._id;
    const file: Express.Multer.File | undefined = req.file;
    file &&
      cloudinary.v2.uploader
        .upload_stream(
          { resource_type: "auto" },
          (
            error: cloudinary.UploadApiErrorResponse | undefined,
            result: cloudinary.UploadApiResponse | undefined
          ) => {
            if (error || !result) {
              return res.status(500).json({
                status: "error",
                message: error || "upload error",
              });
            }

            const fileData: Pick<
              cloudinary.UploadApiResponse,
              "filename" | "size" | "ext" | "url" | "user"
            > = {
              filename: result.original_filename,
              size: result.bytes,
              ext: result.format,
              url: result.url,
              user: userId,
            };

            const uploadFile: IUploadFileDocument = new UploadFileModel(
              fileData
            );

            uploadFile
              .save()
              .then((fileObj: IUploadFile) => {
                res.json({
                  status: "success",
                  file: fileObj,
                });
              })
              .catch((err: any) => {
                res.json({
                  status: "error",
                  message: err,
                });
              });
          }
        )
        .end(file.buffer);
  };

  delete = (req: RequestUserExtended, res: Response): void => {
    const fileId: string = req.user._id;
    UploadFileModel.deleteOne({ _id: fileId }, function (err: any) {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: err,
        });
      }
      res.json({
        status: "success",
      });
    });
  };
}

export default UploadController;
