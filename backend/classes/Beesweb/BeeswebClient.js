const axios = require("axios");

// Cliente da API do provedor beesweb.
// É o ÚNICO ponto do sistema que conversa com api.beesweb.com.br.
// O browser nunca chega aqui — sempre passa pelo nosso backend (porteiro).
class BeeswebClient {
  constructor() {
    this.baseURL = process.env.BEESWEB_BASE_URL || "https://api.beesweb.com.br";
    this.subDomain = process.env.BEESWEB_SUBDOMAIN || "gurupitelecom";
    this.authMode = process.env.BEESWEB_AUTH_MODE || "cpf_cnpj";

    this.http = axios.create({
      baseURL: this.baseURL,
      timeout: 20000,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Faz login no provedor com o CPF/CNPJ e devolve
  // { name, email, cpf_cnpj, api_token, company, pending_payment }
  // POST /customer/sessions
  async login(cpf_cnpj) {
    try {
      const body = {
        cpf_cnpj: this._onlyDigits(cpf_cnpj),
        mode_authentication: this.authMode,
        sub_domain: this.subDomain,
      };

      const { data } = await this.http.post("/customer/sessions", body);

      if (!data || !data.api_token) {
        return { erro: "Cliente não encontrado ou sem token de acesso" };
      }

      return {
        name: data.name,
        email: data.email,
        cpf_cnpj: data.cpf_cnpj,
        api_token: data.api_token,
        company: data.company || null,
        pending_payment: data.pending_payment,
      };
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 401 || status === 422) {
        return { erro: "CPF/CNPJ não encontrado na base do provedor" };
      }
      console.log("Erro no login beesweb:", status, error?.response?.data || error.message);
      return { erro: "Falha ao consultar o provedor" };
    }
  }

  // Lista o RESUMO de cobranças (vencidas ou a vencer em 15 dias) — tela inicial do provedor.
  // GET /customer/charges/dashboard  (Authorization: Bearer <api_token>)
  async getCharges(apiToken, page = 1) {
    try {
      const { data } = await this.http.get("/customer/charges/dashboard", {
        params: { page },
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      return data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) return { erro: "token_provedor_invalido" };
      console.log(
        "Erro ao buscar cobranças beesweb:",
        status,
        error?.response?.data || error.message,
      );
      return { erro: "Falha ao buscar cobranças no provedor" };
    }
  }

  // Lista TODAS as cobranças/faturas do cliente (histórico completo, paginado).
  // GET /customer/charges?order_by=due_date,desc&page=N  (Authorization: Bearer <api_token>)
  async getAllCharges(apiToken, page = 1, orderBy = "due_date,desc") {
    try {
      const { data } = await this.http.get("/customer/charges", {
        params: { order_by: orderBy, page },
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      return data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) return { erro: "token_provedor_invalido" };
      console.log(
        "Erro ao buscar todas as cobranças beesweb:",
        status,
        error?.response?.data || error.message,
      );
      return { erro: "Falha ao buscar cobranças no provedor" };
    }
  }

  // Dados da sessão/cadastro do cliente no provedor (nome, e-mail, cpf/cnpj, empresa).
  // GET /customer/sessions/info  (Authorization: Bearer <api_token>)
  async getSessionInfo(apiToken) {
    try {
      const { data } = await this.http.get("/customer/sessions/info", {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      return data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) return { erro: "token_provedor_invalido" };
      console.log(
        "Erro ao buscar dados da sessão beesweb:",
        status,
        error?.response?.data || error.message,
      );
      return { erro: "Falha ao buscar dados do cliente no provedor" };
    }
  }

  // Consumo de banda do cliente (download/upload por mês, em bytes).
  // GET /customer/bandwidth  (Authorization: Bearer <api_token>)
  // Resposta: { "03/26": { download, upload }, "04/26": {...}, ... }
  async getBandwidth(apiToken) {
    try {
      const { data } = await this.http.get("/customer/bandwidth", {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      return data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) return { erro: "token_provedor_invalido" };
      console.log(
        "Erro ao buscar consumo beesweb:",
        status,
        error?.response?.data || error.message,
      );
      return { erro: "Falha ao buscar consumo no provedor" };
    }
  }

  _onlyDigits(v) {
    return String(v || "").replace(/\D/g, "");
  }
}

module.exports = new BeeswebClient();
