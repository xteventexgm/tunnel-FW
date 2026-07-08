const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const TARGET = " https://interapophyseal-contemningly-sherly.ngrok-free.dev"; // Tu subdominio en loca.lt

// 1. Creamos una única instancia del proxy
const apiProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  ws: true,              // Soporte WebSocket
  secure: true,
  xfwd: true,
  // 2. INYECTAMOS LA CABECERA PARA SALTAR LA ADVERTENCIA DE LOCALTUNNEL
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader("bypass-tunnel-reminder", "true");
    // Opcional: LocalTunnel a veces también revisa el User-Agent
    proxyReq.setHeader("User-Agent", "Render-Relay"); 
  },
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    proxyReq.setHeader("bypass-tunnel-reminder", "true");
    proxyReq.setHeader("User-Agent", "Render-Relay");
  }
});

// 3. Usamos el proxy en Express
app.use("/", apiProxy);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Relay iniciado en puerto ${port} redirigiendo a ${TARGET}`);
});

// 4. Habilitar WebSocket usando la MISMA instancia del proxy
server.on("upgrade", (req, socket, head) => {
  apiProxy.upgrade(req, socket, head);
});
