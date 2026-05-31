const crypto = require("crypto");
const Mailer = require("./Mailer");

// Serviço de OTP por e-mail — totalmente configurável via ENV.
// Mantém os "desafios" em memória (Map) com expiração; sem banco.
//
// ENV:
//   OTP_ENABLED       liga/desliga a verificação (boolean)
//   OTP_LENGTH        tamanho do código (default 6)
//   OTP_TYPE          numeric | alphanumeric (default numeric)
//   OTP_EXP_MINUTES   validade em minutos (default 10)
//   OTP_MAX_ATTEMPTS  tentativas antes de invalidar (default 5)
class OtpService {
  constructor() {
    this.enabled = (process.env.OTP_ENABLED ?? "true") == "true";
    this.length = Number(process.env.OTP_LENGTH || 6);
    this.type = (process.env.OTP_TYPE || "numeric").toLowerCase();
    this.expMinutes = Number(process.env.OTP_EXP_MINUTES || 10);
    this.maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);

    // challengeId -> { codeHash, email, payload, expiresAt, attempts }
    this.store = new Map();

    // limpeza periódica dos desafios expirados
    this._gc = setInterval(() => this._cleanup(), 60 * 1000);
    if (this._gc.unref) this._gc.unref();
  }

  isEnabled() {
    return this.enabled;
  }

  // Gera o código conforme a configuração
  generateCode() {
    if (this.type === "alphanumeric") {
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem caracteres ambíguos
      let out = "";
      for (let i = 0; i < this.length; i++) {
        out += alphabet[crypto.randomInt(0, alphabet.length)];
      }
      return out;
    }
    // numeric
    let out = "";
    for (let i = 0; i < this.length; i++) out += crypto.randomInt(0, 10).toString();
    return out;
  }

  // Cria um desafio, envia o e-mail e devolve o challengeId (sem expor o código)
  async createChallenge(email, payload) {
    const code = this.generateCode();
    const challengeId = crypto.randomUUID();
    const expiresAt = Date.now() + this.expMinutes * 60 * 1000;

    this.store.set(challengeId, {
      codeHash: this._hash(code),
      email,
      payload,
      expiresAt,
      attempts: 0,
    });

    await Mailer.sendOtp(email, code, this.expMinutes);
    return { challengeId, expiresAt };
  }

  // Verifica o código. Retorna { ok, payload } ou { erro }
  verify(challengeId, code) {
    const challenge = this.store.get(challengeId);
    if (!challenge) return { erro: "Desafio inválido ou expirado" };

    if (Date.now() > challenge.expiresAt) {
      this.store.delete(challengeId);
      return { erro: "Código expirado" };
    }

    if (challenge.attempts >= this.maxAttempts) {
      this.store.delete(challengeId);
      return { erro: "Número máximo de tentativas excedido" };
    }

    if (this._hash(String(code)) !== challenge.codeHash) {
      challenge.attempts += 1;
      const restantes = this.maxAttempts - challenge.attempts;
      return { erro: `Código incorreto. Tentativas restantes: ${restantes < 0 ? 0 : restantes}` };
    }

    // sucesso: consome o desafio
    this.store.delete(challengeId);
    return { ok: true, payload: challenge.payload };
  }

  _hash(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
  }

  _cleanup() {
    const now = Date.now();
    for (const [id, c] of this.store.entries()) {
      if (now > c.expiresAt) this.store.delete(id);
    }
  }
}

module.exports = new OtpService();
