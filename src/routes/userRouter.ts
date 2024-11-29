import { Router } from "express";
import { login, signup } from "../controllers/users.controller"; // Ajuste o caminho conforme sua estrutura

const usersRouter = Router();

usersRouter.post("/login", login);
usersRouter.post("/signup", signup);

export default usersRouter;
