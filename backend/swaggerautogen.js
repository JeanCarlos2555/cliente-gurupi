const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Gurupi Portal API",
    description: "Backend porteiro do portal do cliente Gurupi Telecom",
  },
  // Em produção, aponte para o subdomínio de API (ex.: api-portal.gurupitelecom.com.br + https).
  // Em dev, cai no localhost:PORT / http.
  host: process.env.SWAGGER_HOST || `localhost:${process.env.PORT || 3030}`,
  schemes: [process.env.SWAGGER_SCHEME || "http"],
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./index.js");
});
