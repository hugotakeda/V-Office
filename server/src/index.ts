import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocketHandlers } from "./socket/handlers";
import pontoRoutes from "./routes/ponto";

// ── Configuração ───────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || "3001", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// ── Express ────────────────────────────────────────────────────

const app = express();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Middleware de logging
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ── Rotas ──────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Escritório Virtual - Backend",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/ponto", pontoRoutes);

// Rota para buscar todas as salas
app.get("/api/salas", async (_req, res) => {
  try {
    const { prisma } = await import("./lib/prisma");
    const salas = await prisma.sala.findMany({
      orderBy: { id: "asc" },
    });
    res.json(salas);
  } catch (error) {
    console.error("Erro ao buscar salas:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Rota para buscar todos os usuários
app.get("/api/usuarios", async (_req, res) => {
  try {
    const { prisma } = await import("./lib/prisma");
    const usuarios = await prisma.usuario.findMany({
      include: {
        cubiculoPadrao: { select: { id: true, nome: true } },
      },
      orderBy: { id: "asc" },
    });
    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Rota para criar ou buscar usuário existente pelo email
app.post("/api/usuarios", async (req, res) => {
  try {
    const { nome, email } = req.body;
    if (!nome || !email) {
      return res.status(400).json({ error: "Nome e email são obrigatórios" });
    }

    const { prisma } = await import("./lib/prisma");
    
    // Tenta encontrar usuário existente
    let usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // Se não existir, cria
    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: { nome, email },
      });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro interno ao criar usuário" });
  }
});

// ── HTTP Server + Socket.io ────────────────────────────────────

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Configurar handlers de WebSocket
setupSocketHandlers(io);

// ── Iniciar Servidor ───────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🏢  Escritório Virtual - Backend Server             ║
║                                                       ║
║   📡  HTTP:      http://localhost:${PORT}               ║
║   🔌  Socket.io: ws://localhost:${PORT}                 ║
║   🌐  CORS:      ${CORS_ORIGIN}              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// ── Graceful Shutdown ──────────────────────────────────────────

process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM recebido. Encerrando servidor...");
  io.close();
  httpServer.close(() => {
    console.log("✅ Servidor encerrado com sucesso");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT recebido. Encerrando servidor...");
  io.close();
  httpServer.close(() => {
    console.log("✅ Servidor encerrado com sucesso");
    process.exit(0);
  });
});
