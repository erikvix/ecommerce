import { Router } from "express";
import { login, signup } from "../controllers/users.controller"; // Ajuste o caminho conforme sua estrutura

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/signup", signup);

export default authRouter;
