const crypto = require("crypto");

// Criptografia simétrica AES-256-GCM para cifrar o api_token do provedor
// antes de embuti-lo no nosso JWT. A chave vem de SESSION_ENC_KEY (32 bytes em hex).
class CryptoBox {
  constructor() {
    const keyHex = process.env.SESSION_ENC_KEY || "";
    this.key = keyHex ? Buffer.from(keyHex, "hex") : null;
    if (this.key && this.key.length !== 32) {
      console.log(
        "AVISO: SESSION_ENC_KEY deve ter 32 bytes (64 caracteres hex). Criptografia desabilitada.",
      );
      this.key = null;
    }
  }

  // Retorna string "iv:tag:cipher" em base64. Se não houver chave, devolve o texto puro (com aviso).
  encrypt(plain) {
    if (plain == null) return null;
    if (!this.key) return String(plain);

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);
    const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(":");
  }

  decrypt(payload) {
    if (payload == null) return null;
    if (!this.key) return String(payload);

    const parts = String(payload).split(":");
    if (parts.length !== 3) return String(payload); // não estava criptografado

    try {
      const iv = Buffer.from(parts[0], "base64");
      const tag = Buffer.from(parts[1], "base64");
      const enc = Buffer.from(parts[2], "base64");
      const decipher = crypto.createDecipheriv("aes-256-gcm", this.key, iv);
      decipher.setAuthTag(tag);
      const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
      return dec.toString("utf8");
    } catch (error) {
      console.log("Erro ao descriptografar api_token:", error.message);
      return null;
    }
  }
}

module.exports = new CryptoBox();
