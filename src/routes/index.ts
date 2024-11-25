import { Router } from "express";
import * as usersController from "../controllers/users.controller";
const usersRouter = Router();

usersRouter.use("/login", usersController.login);
usersRouter.use("/signup", usersController.signup);

export default usersRouter;
