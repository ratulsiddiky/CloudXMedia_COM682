import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mediaRoutes from "./src/routes/media.routes.js";
import helmet from "helmet";
import cors from "cors";


dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.blob.core.windows.net"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(cors());
app.use(compression());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/media", apiLimiter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d", 
  })
);


app.use("/api/media", mediaRoutes);


app.get("/health", (req, res) => res.json({ ok: true }));


const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Running on http://localhost:${port}`)
);