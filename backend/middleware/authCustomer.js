const CustomerToken = require("../classes/Auth/CustomerToken");

// Protege as rotas do cliente. Lê a sessão do cookie httpOnly (preferencial)
// ou do header Authorization: Bearer <jwt> (fallback).
// Disponibiliza req.customer = { cpf_cnpj, name, email, company_id, api_token }.
function authCustomer(req, res, next) {
  const cookieName = process.env.SESSION_COOKIE_NAME || "gt_session";
  const fromCookie = req.cookies?.[cookieName];
  const authorization = req.headers.authorization;
  const fromHeader = authorization?.split(" ")[1] ?? authorization;

  const token = fromCookie || fromHeader;

  if (!token) {
    return res.status(401).json({ erro: "Sessão não informada" });
  }

  const customer = CustomerToken.verify(token);

  if (!customer) {
    return res.status(401).json({ erro: "Sessão inválida ou expirada" });
  }

  req.customer = customer;
  next();
}

module.exports = authCustomer;
