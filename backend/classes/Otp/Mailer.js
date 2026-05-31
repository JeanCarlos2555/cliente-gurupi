const nodemailer = require("nodemailer");

// Envio de e-mail (OTP). Se SMTP não estiver configurado, cai em modo "console"
// (loga o código no terminal) para facilitar o desenvolvimento.
class Mailer {
  constructor() {
    this.from = process.env.SMTP_FROM || "naoresponda@gurupitelecom.com.br";
    this.fromName = process.env.SMTP_FROM_NAME || "Gurupi Telecom";

    const host = process.env.SMTP_HOST;
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE == "true",
        auth:
          process.env.SMTP_USER || process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      });
    } else {
      this.transporter = null;
      console.log("AVISO: SMTP não configurado. OTP será exibido no console (modo dev).");
    }
  }

  async sendOtp(to, code, expMinutes) {
    if (!this.transporter) {
      console.log(`\n===== OTP (modo dev) =====\nPara: ${to}\nCódigo: ${code}\nValidade: ${expMinutes} min\n==========================\n`);
      return { dev: true };
    }

    const html = this._template(code, expMinutes);

    await this.transporter.sendMail({
      from: `"${this.fromName}" <${this.from}>`,
      to,
      subject: `Seu código de acesso: ${code}`,
      text: `Seu código de acesso à Central do Cliente Gurupi Telecom é ${code}. Ele expira em ${expMinutes} minutos.`,
      html,
    });

    return { sent: true };
  }

  _template(code, expMinutes) {
    return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; background:#ffffff; border:1px solid #e6e6e6; border-radius:12px; overflow:hidden;">
      <div style="background:#0c6b3f; padding:24px; text-align:center;">
        <h1 style="color:#ffffff; margin:0; font-size:20px;">GURUPI TELECOM</h1>
        <p style="color:#bdf0d4; margin:4px 0 0; font-size:12px;">Na velocidade da sua imaginação</p>
      </div>
      <div style="padding:32px 24px; text-align:center;">
        <p style="color:#333; font-size:15px; margin:0 0 16px;">Use o código abaixo para acessar a Central do Cliente:</p>
        <div style="font-size:34px; font-weight:bold; letter-spacing:8px; color:#0c6b3f; background:#eafaf1; padding:16px; border-radius:10px; display:inline-block;">${code}</div>
        <p style="color:#888; font-size:13px; margin:20px 0 0;">O código expira em ${expMinutes} minutos.<br/>Se você não solicitou, ignore este e-mail.</p>
      </div>
    </div>`;
  }
}

module.exports = new Mailer();
