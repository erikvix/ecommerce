import { Request, Response } from "express";
import { User } from "../models/users";

export const login = (req: Request, res: Response) => {
  const user = new User(req.body);
  user.login(user);
  res.json(user);
};

export const signup = (req: Request, res: Response) => {
  const user = new User(req.body);
  res.json(user);
};
