import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

function authToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(403).json({ status: 403, message: "Token inválido" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.sendStatus(403, err);
    }
    req.user = user;
    next();
  });
}

module.exports = authToken;
