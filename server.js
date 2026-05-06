import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mediaRoutes from "./src/routes/media.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// API
app.use("/api/media", mediaRoutes);

// Health check (useful for Azure)
app.get("/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on http://localhost:${port}`));