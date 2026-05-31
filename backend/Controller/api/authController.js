const express = require("express");
const router = express.Router();

const Beesweb = require("../../classes/Beesweb/BeeswebClient");
const Otp = require("../../classes/Otp/OtpService");
const CustomerToken = require("../../classes/Auth/CustomerToken");

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "gt_session";

// Opções do cookie de sessão.
// Portal e API ficam em subdomínios diferentes (cross-site), então em produção
// o cookie precisa de SameSite=None + Secure para ser reenviado pelo navegador.
// SameSite=None EXIGE Secure; por isso forçamos secure quando sameSite=none.
function cookieOptions() {
  const sameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  const secure = process.env.COOKIE_SECURE == "true" || sameSite === "none";
  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 24 * 60 * 60 * 1000, // 1 dia
    path: "/",
  };
}

function setSessionCookie(res, dados) {
  const token = CustomerToken.sign(dados);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  return token;
}

// Resposta pública com os dados do cliente (sem segredos)
function publicCustomer(dados) {
  return {
    name: dados.name,
    cpf_cnpj: dados.cpf_cnpj,
    company: dados.company
      ? {
          name: dados.company.name,
          logo: dados.company.logo,
          phone: dados.company.phone,
          address: dados.company.address,
        }
      : null,
  };
}

// POST /api/auth/login  { cpf_cnpj }
// Valida o CPF no provedor. Se OTP ligado, dispara o código por e-mail e devolve challengeId.
// Se OTP desligado, já emite a sessão.
router.post("/login", async (req, res) => {
  try {
    const { cpf_cnpj } = req.body;

    if (!cpf_cnpj || String(cpf_cnpj).replace(/\D/g, "").length < 11) {
      return res.status(400).json({ erro: "CPF/CNPJ inválido" });
    }

    const session = await Beesweb.login(cpf_cnpj);
    if (session.erro) {
      return res.status(401).json({ erro: session.erro });
    }

    // OTP desligado: emite a sessão direto
    if (!Otp.isEnabled()) {
      const token = setSessionCookie(res, session);
      return res.status(200).json({
        otp_required: false,
        token,
        customer: publicCustomer(session),
      });
    }

    // OTP ligado: precisa de e-mail cadastrado
    if (!session.email) {
      return res.status(422).json({
        erro: "Não há e-mail cadastrado para enviar o código. Procure o suporte.",
      });
    }

    const { challengeId, expiresAt } = await Otp.createChallenge(
      session.email,
      session,
    );

    return res.status(200).json({
      otp_required: true,
      challenge_id: challengeId,
      email: CustomerToken._maskEmail(session.email),
      expires_at: expiresAt,
    });
  } catch (error) {
    console.log("Erro no /auth/login:", error);
    return res.status(500).json({ erro: "Erro ao iniciar sessão" });
  }
});

// POST /api/auth/verify-otp  { challenge_id, code }
router.post("/verify-otp", async (req, res) => {
  try {
    const { challenge_id, code } = req.body;

    if (!challenge_id || !code) {
      return res.status(400).json({ erro: "Informe o desafio e o código" });
    }

    const result = Otp.verify(challenge_id, code);
    if (result.erro) {
      return res.status(401).json({ erro: result.erro });
    }

    const session = result.payload;
    const token = setSessionCookie(res, session);

    return res.status(200).json({
      token,
      customer: publicCustomer(session),
    });
  } catch (error) {
    console.log("Erro no /auth/verify-otp:", error);
    return res.status(500).json({ erro: "Erro ao validar código" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  // Limpa com os mesmos atributos do cookie de sessão (senão o navegador não casa).
  const { httpOnly, secure, sameSite, path } = cookieOptions();
  res.clearCookie(COOKIE_NAME, { httpOnly, secure, sameSite, path });
  return res.status(200).json({ ok: true });
});

module.exports = router;
