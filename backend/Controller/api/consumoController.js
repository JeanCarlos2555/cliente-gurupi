const express = require("express");
const router = express.Router();

const Beesweb = require("../../classes/Beesweb/BeeswebClient");

// "03/26" -> chave ordenável "2026-03"
function chaveOrdenavel(periodo) {
  const [mes, ano] = periodo.split("/");
  return `20${ano}-${mes}`;
}

// GET /api/consumo
// Normaliza a resposta do provedor (objeto por mês, em bytes) para um array
// ordenado cronologicamente. Mantém os bytes brutos; a formatação fica no front.
router.get("/", async (req, res) => {
  try {
    const data = await Beesweb.getBandwidth(req.customer.api_token);

    if (data.erro) {
      if (data.erro === "token_provedor_invalido") {
        return res.status(401).json({ erro: "Sessão expirada. Faça login novamente." });
      }
      return res.status(502).json({ erro: data.erro });
    }

    const meses = Object.entries(data)
      .map(([periodo, valores]) => ({
        periodo, // "03/26"
        download: Number(valores?.download ?? 0),
        upload: Number(valores?.upload ?? 0),
      }))
      .sort((a, b) => chaveOrdenavel(a.periodo).localeCompare(chaveOrdenavel(b.periodo)));

    return res.status(200).json({ meses });
  } catch (error) {
    console.log("Erro ao listar consumo:", error);
    return res.status(500).json({ erro: "Erro ao listar consumo" });
  }
});

module.exports = router;
