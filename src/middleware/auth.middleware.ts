import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/users";

interface AuthenticatedRequest extends Request {
  user?: User;
}
function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN as string) as User;
  } catch {
    return null;
  }
}

function authToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: 401,
      message: "Token não encontrado ou formato inválido",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  const decodedUser = verifyToken(token);
  if (!decodedUser) {
    res
      .status(403)
      .json({ status: 403, message: "Token inválido ou expirado" });
    return;
  }

  req.user = decodedUser;
  next();
}

export default authToken;
