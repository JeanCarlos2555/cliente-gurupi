const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const authController = require("./api/authController");
const faturasController = require("./api/faturasController");
const clienteController = require("./api/clienteController");
const consumoController = require("./api/consumoController");
const authCustomer = require("../middleware/authCustomer");

// Limita tentativas nas rotas de autenticação (anti força-bruta de CPF/OTP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // 20 tentativas por IP na janela
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas tentativas. Tente novamente mais tarde." },
});

router.use(
  "/auth",
  (req, res, next) => {
    /* #swagger.tags = ['Auth'] */
    next();
  },
  authLimiter,
  authController,
);

router.use(
  "/faturas",
  (req, res, next) => {
    /* #swagger.tags = ['Faturas'] */
    next();
  },
  authCustomer,
  faturasController,
);

router.use(
  "/cliente",
  (req, res, next) => {
    /* #swagger.tags = ['Cliente'] */
    next();
  },
  authCustomer,
  clienteController,
);

router.use(
  "/consumo",
  (req, res, next) => {
    /* #swagger.tags = ['Consumo'] */
    next();
  },
  authCustomer,
  consumoController,
);

module.exports = router;
