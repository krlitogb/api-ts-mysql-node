import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, nombre } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO usuarios (username, password, nombre) VALUES (?, ?, ?)",
      [username, hashedPassword, nombre]
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      userId: (result as any).insertId,
    });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query("SELECT * FROM usuarios WHERE username = ?", [
      username,
    ]);

    if ((rows as User[]).length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = (rows as User[])[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

// Middleware para verificar el token JWT
export const verifyToken = (req: Request, res: Response): any => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Formato: Bearer <token>

    if (!token) {
      return res
        .status(401)
        .json({ message: "Acceso denegado. No se proporcionó token." });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token inválido o expirado." });
      }

      const userId = (decoded as any).userId; // Asignar userId al request
      const exp = new Date((decoded as any).exp * 1000);

      const hours = exp.getHours().toString().padStart(2, "0");
      const minutes = exp.getMinutes().toString().padStart(2, "0");
      const seconds = exp.getSeconds().toString().padStart(2, "0");

      const expiraEn = `${hours}:${minutes}:${seconds}`;

      return res.status(200).json({
        message: "Token válido y confirmado",
        userId: userId,
        exp: expiraEn,
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error });
  }
};
