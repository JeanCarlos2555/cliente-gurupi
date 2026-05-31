// HTTP Basic Auth para proteger a página /api-docs
function swaggerAuth(req, res, next) {
  const SWAGGER_USER = process.env.SWAGGER_USER;
  const SWAGGER_PASSWORD = process.env.SWAGGER_PASSWORD;

  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme !== "Basic" || !encoded) {
    res.set("WWW-Authenticate", 'Basic realm="Swagger"');
    return res.status(401).json({ erro: "Autenticação necessária" });
  }

  const [user, pass] = Buffer.from(encoded, "base64").toString().split(":");

  if (user !== SWAGGER_USER || pass !== SWAGGER_PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="Swagger"');
    return res.status(401).json({ erro: "Credenciais inválidas" });
  }

  next();
}

module.exports = swaggerAuth;
