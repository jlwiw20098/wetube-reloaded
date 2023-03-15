import express from "express";
import { watch, getEdit, postEdit, getUpload, postUpload, deleteVideo } from "../conterollers/videoControllers";
import { protectorMiddleware } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit); //get을 하게 되면 함수 getEdit을, post를 하게 되면 함수 postEdit을 실행
videoRouter.route("/:id([0-9a-f]{24})/delete").all(protectorMiddleware).get(deleteVideo);
videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(postUpload);

export default videoRouter;
