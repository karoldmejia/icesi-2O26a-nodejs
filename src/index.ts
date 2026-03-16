import express from "express";
import type { Request, Response } from "express";
import dotenv from 'dotenv';
import routes from "./routes";
import { db } from "./config/db";

const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hola mundo desde Node.js con TypeScript!");
});

// Configurar rutas antes de iniciar el servidor
routes(app);

const port = process.env.PORT || 3000;

// Conectar a db y luego iniciar servidor
db.then(() => {
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
}).catch((error) => {
    console.error("Error conectando a la base de datos:", error);
    process.exit(1);
});