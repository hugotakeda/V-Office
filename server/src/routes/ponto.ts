import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// ── GET /api/ponto/:userId ─────────────────────────────────────
// Retorna todos os registros de ponto de um usuário
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId as string, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuário inválido" });
    }

    const { dataInicio, dataFim } = req.query;

    const where: any = { idUsuario: userId };

    // Filtro por período (opcional)
    if (dataInicio || dataFim) {
      where.dataHoraEntrada = {};
      if (dataInicio) {
        where.dataHoraEntrada.gte = new Date(dataInicio as string);
      }
      if (dataFim) {
        where.dataHoraEntrada.lte = new Date(dataFim as string);
      }
    }

    const pontos = await prisma.ponto.findMany({
      where,
      include: {
        sala: { select: { id: true, nome: true, tipo: true } },
      },
      orderBy: { dataHoraEntrada: "desc" },
    });

    // Calcular duração de cada sessão
    const pontosComDuracao = pontos.map((p) => {
      const entrada = new Date(p.dataHoraEntrada);
      const saida = p.dataHoraSaida ? new Date(p.dataHoraSaida) : null;
      const duracaoMs = saida ? saida.getTime() - entrada.getTime() : null;
      const duracaoMinutos = duracaoMs ? Math.round(duracaoMs / 60000) : null;

      return {
        ...p,
        duracaoMinutos,
        duracaoFormatada: duracaoMinutos
          ? `${Math.floor(duracaoMinutos / 60)}h ${duracaoMinutos % 60}min`
          : "Em andamento",
      };
    });

    return res.json({
      userId,
      totalRegistros: pontosComDuracao.length,
      registros: pontosComDuracao,
    });
  } catch (error) {
    console.error("Erro ao buscar ponto:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ── GET /api/ponto/:userId/today ───────────────────────────────
// Retorna resumo do dia atual do usuário
router.get("/:userId/today", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId as string, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuário inválido" });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const pontosHoje = await prisma.ponto.findMany({
      where: {
        idUsuario: userId,
        dataHoraEntrada: {
          gte: hoje,
          lt: amanha,
        },
      },
      include: {
        sala: { select: { id: true, nome: true, tipo: true } },
      },
      orderBy: { dataHoraEntrada: "asc" },
    });

    // Calcular tempo total trabalhado hoje
    let totalMinutos = 0;
    pontosHoje.forEach((p) => {
      const entrada = new Date(p.dataHoraEntrada);
      const saida = p.dataHoraSaida ? new Date(p.dataHoraSaida) : new Date();
      totalMinutos += Math.round((saida.getTime() - entrada.getTime()) / 60000);
    });

    const horasTrabalhadas = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;

    // Verificar se está ativo (tem ponto sem saída)
    const pontoAtivo = pontosHoje.find((p) => !p.dataHoraSaida);

    return res.json({
      userId,
      data: hoje.toISOString().split("T")[0],
      totalSessoes: pontosHoje.length,
      totalFormatado: `${horasTrabalhadas}h ${minutosRestantes}min`,
      totalMinutos,
      estaAtivo: !!pontoAtivo,
      salaAtual: pontoAtivo?.sala || null,
      sessoes: pontosHoje,
    });
  } catch (error) {
    console.error("Erro ao buscar ponto de hoje:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ── GET /api/ponto/salas/status ────────────────────────────────
// Retorna o status atual de todas as salas (quem está em cada uma)
router.get("/salas/status", async (_req: Request, res: Response) => {
  try {
    const salas = await prisma.sala.findMany({
      include: {
        pontos: {
          where: { dataHoraSaida: null },
          include: {
            usuario: { select: { id: true, nome: true, email: true } },
          },
        },
      },
    });

    const salasComStatus = salas.map((sala) => ({
      id: sala.id,
      nome: sala.nome,
      tipo: sala.tipo,
      capacidade: sala.capacidade,
      ocupantes: sala.pontos.map((p) => p.usuario),
      ocupacao: sala.pontos.length,
      disponivel: sala.pontos.length < sala.capacidade,
    }));

    return res.json(salasComStatus);
  } catch (error) {
    console.error("Erro ao buscar status das salas:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
