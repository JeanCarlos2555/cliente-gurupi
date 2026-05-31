require("dotenv").config();

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));

// CORS com credenciais (cookie httpOnly de sessão).
// Em dev, libera qualquer porta de localhost/127.0.0.1 (o Vite pode subir em 5173, 5174, 5175...).
// Em produção, restringe ao FRONTEND_ORIGIN (lista separada por vírgula).
const ALLOWED_ORIGINS = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const IS_DEV = (process.env.NODE_ENV || "development") === "development";

app.use(
  cors({
    origin(origin, callback) {
      // requests sem Origin (curl, mesmo host) são permitidas
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      if (IS_DEV && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const apiController = require("./Controller/apiController");
const swaggerAuth = require("./middleware/swaggerAuth");

app.use("/api", apiController);
app.use("/api-docs", swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get("/status", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Documentação disponível em http://localhost:${PORT}/api-docs`);
});
