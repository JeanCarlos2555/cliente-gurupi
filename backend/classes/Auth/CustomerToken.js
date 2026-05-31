const jwt = require("jsonwebtoken");
const CryptoBox = require("../Crypto/CryptoBox");

// JWT da sessão do cliente no NOSSO portal.
// O api_token do provedor vai cifrado dentro do payload (campo `pt`),
// de modo que mesmo quem decodificar o JWT não obtém o token do provedor.
class CustomerToken {
  constructor() {
    this.secret = process.env.CUSTOMER_JWT_SECRET;
    this.expiresIn = process.env.CUSTOMER_JWT_EXPIRESIN || "1d";
  }

  // dados: { cpf_cnpj, name, email, api_token, company }
  sign(dados) {
    const payload = {
      cpf_cnpj: dados.cpf_cnpj,
      name: dados.name,
      email: this._maskEmail(dados.email),
      // api_token do provedor, cifrado:
      pt: CryptoBox.encrypt(dados.api_token),
      company_id: dados?.company?.company_id ?? null,
    };

    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  // Verifica o JWT e devolve os dados + api_token já descriptografado (apenas no servidor)
  verify(token) {
    try {
      const decoded = jwt.verify(token, this.secret);
      const api_token = CryptoBox.decrypt(decoded.pt);
      if (!api_token) return null;
      return {
        cpf_cnpj: decoded.cpf_cnpj,
        name: decoded.name,
        email: decoded.email,
        company_id: decoded.company_id,
        api_token,
      };
    } catch (error) {
      return null;
    }
  }

  // mostra só parte do e-mail no front (ex.: ge****@gmail.com)
  _maskEmail(email) {
    if (!email || !email.includes("@")) return email || null;
    const [user, domain] = email.split("@");
    const visible = user.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(user.length - 2, 1))}@${domain}`;
  }
}

module.exports = new CustomerToken();
