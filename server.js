const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Cambia esto por tu URL de Ngrok o LocalTunnel real
const TARGET = process.env.TARGET_URL || " https://interapophyseal-contemningly-sherly.ngrok-free.dev";

// 1. Crear una única instancia del proxy
const apiProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  ws: true,              // Habilita el soporte para WebSockets
  secure: false,         // 'false' evita problemas de certificados SSL auto-firmados o mismatch
  xfwd: true,
  onProxyReq: (proxyReq, req, res) => {
    // 2. Fundamental para Ngrok: Evitar la pantalla de advertencia en navegadores
    proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
    proxyReq.setHeader('Bypass-Tunnel-Reminder', 'true');
  }
});

app.use("/", apiProxy);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Relay iniciado en puerto ${port} apuntando a ${TARGET}`);
});

// 3. Habilitar WebSockets correctamente reutilizando la misma instancia
server.on("upgrade", apiProxy.upgrade);
