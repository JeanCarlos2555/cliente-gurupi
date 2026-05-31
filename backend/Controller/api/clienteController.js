const express = require("express");
const router = express.Router();

const Beesweb = require("../../classes/Beesweb/BeeswebClient");

// GET /api/cliente/me  — dados da sessão atual (sem segredos)
router.get("/me", async (req, res) => {
  try {
    const { name, cpf_cnpj, email, company_id } = req.customer;
    return res.status(200).json({ name, cpf_cnpj, email, company_id });
  } catch (error) {
    console.log("Erro no /cliente/me:", error);
    return res.status(500).json({ erro: "Erro ao obter dados do cliente" });
  }
});

// GET /api/cliente/perfil — dados de cadastro do cliente (somente leitura),
// buscados frescos no provedor. Devolve apenas name, email e cpf_cnpj.
router.get("/perfil", async (req, res) => {
  try {
    const data = await Beesweb.getSessionInfo(req.customer.api_token);

    if (data.erro) {
      if (data.erro === "token_provedor_invalido") {
        return res.status(401).json({ erro: "Sessão expirada. Faça login novamente." });
      }
      return res.status(502).json({ erro: data.erro });
    }

    return res.status(200).json({
      name: data.name ?? null,
      email: data.email ?? null,
      cpf_cnpj: data.cpf_cnpj ?? null,
    });
  } catch (error) {
    console.log("Erro no /cliente/perfil:", error);
    return res.status(500).json({ erro: "Erro ao obter dados do cliente" });
  }
});

module.exports = router;
