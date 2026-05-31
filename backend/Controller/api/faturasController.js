const express = require("express");
const router = express.Router();

const Beesweb = require("../../classes/Beesweb/BeeswebClient");

// Deriva a situação da fatura a partir das datas (não confia só no código interno do provedor)
function derivarStatus(charge) {
  if (charge.date_payment || charge.value_paid) return "pago";
  if (charge.due_date) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const venc = new Date(charge.due_date + "T00:00:00");
    if (venc < hoje) return "vencido";
  }
  return "a_vencer";
}

// Mapeia a cobrança do provedor para um shape limpo e SEGURO.
// Remove campos sensíveis (ex.: payment_gateway.configurations.token do Asaas,
// ids internos de gateway, etc.) que a API do provedor expõe indevidamente.
function mapCharge(c) {
  return {
    id: c.id,
    value: c.value,
    value_paid: c.value_paid,
    due_date: c.due_date,
    date_payment: c.date_payment,
    description: c.description,
    status: derivarStatus(c),
    // meios de pagamento (seguros de expor ao próprio cliente):
    link: c.link, // link da fatura (Asaas)
    barcode: c.barcode, // linha digitável / código de barras
    pix_copia_cola: c.pix_qr_code, // pix copia-e-cola
    pix_qr_code_img: c.pix_qr_code_img, // imagem base64 do QR
  };
}

function montarResposta(res, data) {
  if (data.erro) {
    if (data.erro === "token_provedor_invalido") {
      return res.status(401).json({ erro: "Sessão expirada. Faça login novamente." });
    }
    return res.status(502).json({ erro: data.erro });
  }

  const faturas = Array.isArray(data.data) ? data.data.map(mapCharge) : [];

  return res.status(200).json({
    faturas,
    paginacao: {
      current_page: data.current_page,
      last_page: data.last_page,
      per_page: data.per_page,
      total: data.total,
    },
  });
}

// GET /api/faturas?page=1  — TODAS as faturas (histórico completo, mais recentes primeiro)
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const data = await Beesweb.getAllCharges(req.customer.api_token, page);
    return montarResposta(res, data);
  } catch (error) {
    console.log("Erro ao listar faturas:", error);
    return res.status(500).json({ erro: "Erro ao listar faturas" });
  }
});

// GET /api/faturas/resumo  — só vencidas ou a vencer em 15 dias (tela inicial do provedor)
router.get("/resumo", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const data = await Beesweb.getCharges(req.customer.api_token, page);
    return montarResposta(res, data);
  } catch (error) {
    console.log("Erro ao listar resumo de faturas:", error);
    return res.status(500).json({ erro: "Erro ao listar faturas" });
  }
});

module.exports = router;
