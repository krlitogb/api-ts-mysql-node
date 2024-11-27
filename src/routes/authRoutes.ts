import { Router, Request, Response, NextFunction } from "express";
import { register, login, verifyToken } from "../controllers/authController"; // Importa las funciones del controlador

const router = Router(); // Usar `Router` en lugar de `express.Router()`

router.post("/register", async (req, res) => {
  try {
    await register(req, res);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    await login(req, res);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Ruta protegida para verificar el token
router.get("/generar", (req: Request, res: Response) => {
  try {
    verifyToken(req, res);
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
