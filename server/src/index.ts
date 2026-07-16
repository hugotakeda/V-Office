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
      const { nome, email, avatar } = req.body;
      if (!nome || !email) {
        return res.status(400).json({ error: "Nome e email são obrigatórios" });
      }

      const { prisma } = await import("./lib/prisma");
      
      // Tenta encontrar usuário existente
      let usuario = await prisma.usuario.findUnique({
        where: { email },
      });

      // Se existir, atualiza o avatar (se tiver recebido um novo)
      if (usuario) {
        if (avatar && usuario.avatar !== avatar) {
          usuario = await prisma.usuario.update({
            where: { email },
            data: { avatar },
          });
        }
      } else {
        // Se não existir, cria
        usuario = await prisma.usuario.create({
          data: { nome, email, avatar: avatar || null },
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

async function ensureRoomsExist() {
  const { prisma } = await import("./lib/prisma");
  const roomCount = await prisma.sala.count();
  
  if (roomCount === 0) {
    console.log("🌱 Salas não encontradas no banco. Criando salas padrão...");
    await Promise.all([
      prisma.sala.upsert({ where: { id: 1 }, update: {}, create: { id: 1, nome: "Cúbiculo 1", tipo: "CUBICULO", capacidade: 2, posicaoX: -8, posicaoZ: -4 } }),
      prisma.sala.upsert({ where: { id: 2 }, update: {}, create: { id: 2, nome: "Cúbiculo 2", tipo: "CUBICULO", capacidade: 2, posicaoX: -4, posicaoZ: -4 } }),
      prisma.sala.upsert({ where: { id: 3 }, update: {}, create: { id: 3, nome: "Cúbiculo 3", tipo: "CUBICULO", capacidade: 2, posicaoX: 0, posicaoZ: -4 } }),
      prisma.sala.upsert({ where: { id: 4 }, update: {}, create: { id: 4, nome: "Cúbiculo 4", tipo: "CUBICULO", capacidade: 2, posicaoX: 4, posicaoZ: -4 } }),
      prisma.sala.upsert({ where: { id: 5 }, update: {}, create: { id: 5, nome: "Cúbiculo 5", tipo: "CUBICULO", capacidade: 2, posicaoX: 8, posicaoZ: -4 } }),
      prisma.sala.upsert({ where: { id: 6 }, update: {}, create: { id: 6, nome: "Cúbiculo 6", tipo: "CUBICULO", capacidade: 2, posicaoX: -8, posicaoZ: 4 } }),
      prisma.sala.upsert({ where: { id: 7 }, update: {}, create: { id: 7, nome: "Cúbiculo 7", tipo: "CUBICULO", capacidade: 2, posicaoX: -4, posicaoZ: 4 } }),
      prisma.sala.upsert({ where: { id: 8 }, update: {}, create: { id: 8, nome: "Cúbiculo 8", tipo: "CUBICULO", capacidade: 2, posicaoX: 0, posicaoZ: 4 } }),
      prisma.sala.upsert({ where: { id: 9 }, update: {}, create: { id: 9, nome: "Cúbiculo 9", tipo: "CUBICULO", capacidade: 2, posicaoX: 4, posicaoZ: 4 } }),
      prisma.sala.upsert({ where: { id: 10 }, update: {}, create: { id: 10, nome: "Cúbiculo 10", tipo: "CUBICULO", capacidade: 2, posicaoX: 8, posicaoZ: 4 } }),
      prisma.sala.upsert({ where: { id: 11 }, update: {}, create: { id: 11, nome: "Sala de Reuniões", tipo: "REUNIAO", capacidade: 12, posicaoX: -12, posicaoZ: 0 } }),
      prisma.sala.upsert({ where: { id: 12 }, update: {}, create: { id: 12, nome: "Copa / Café", tipo: "CAFE", capacidade: 8, posicaoX: 12, posicaoZ: 0 } }),
    ]);
    console.log("✅ Salas criadas com sucesso!");
  }
}

// ── Iniciar Servidor ───────────────────────────────────────────

ensureRoomsExist().then(() => {
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
}).catch(err => {
  console.error("❌ Falha crítica ao inicializar banco de dados:", err);
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
