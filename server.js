const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors"); // npm install cors

const app = express();

// 1. Elimina el espacio al inicio que estaba rompiendo la URL
const TARGET = (process.env.TARGET_URL || "https://interapophyseal-contemningly-sherly.ngrok-free.dev").trim();

// 2. Configurar CORS directamente en el relay (Render) para evitar bloqueos del navegador móvil
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
}));

// 3. Crear instancia del proxy
const apiProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  ws: true,
  secure: false,         
  xfwd: true,
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
    proxyReq.setHeader('Bypass-Tunnel-Reminder', 'true');
  },
  // 4. ¡VITAL para WebSockets! Inyectar las cabeceras en las peticiones WS
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
    proxyReq.setHeader('Bypass-Tunnel-Reminder', 'true');
  }
});

app.use("/", apiProxy);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Relay iniciado en puerto ${port} apuntando a ${TARGET}`);
});

server.on("upgrade", apiProxy.upgrade);
