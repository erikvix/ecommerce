import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../database/database.config";
import { User } from "../models/users";

interface UserPayload {
  name?: string;
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;

const validatePayload = (payload: UserPayload, requiredFields: string[]) => {
  for (const field of requiredFields) {
    if (!payload[field as keyof UserPayload]) {
      return false;
    }
  }
  if (typeof payload.password !== "string") {
    return false;
  }
  return true;
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const payload: UserPayload = req.body;

  if (!validatePayload(payload, ["email", "password"])) {
    res.status(400).json({ status: 400, message: "Missing data" });
    return;
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [payload.email],
    async (err, user: User | null) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ status: 500, message: "Server error" });
        return;
      }

      if (!user || !(await bcrypt.compare(payload.password, user.password))) {
        res
          .status(401)
          .json({ status: 401, message: "E-mail ou password invalidos" });
        return;
      }

      res.status(200).json({ status: 200, message: "Login successful" });
    }
  );
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const payload: UserPayload = req.body;

  if (!validatePayload(payload, ["name", "email", "password"])) {
    res.status(400).json({ status: 400, message: "Missing data" });
    return;
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [payload.email],
    async (err, user: User | null) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ status: 500, message: "Server error" });
        return;
      }

      if (user) {
        res.status(400).json({ status: 400, message: "Email already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);

      db.run(
        "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
        [payload.email, payload.name, hashedPassword],
        (err) => {
          if (err) {
            console.error(err.message);
            res
              .status(500)
              .json({ status: 500, message: "Error creating user" });
            return;
          }

          res
            .status(201)
            .json({ status: 201, message: "User successfully created" });
        }
      );
    }
  );
};
