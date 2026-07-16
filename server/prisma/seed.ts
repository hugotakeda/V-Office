import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // ── Criar Salas ──────────────────────────────────────────────
  const salas = await Promise.all([
    // Cúbiculos - Fileira 1 (frente)
    prisma.sala.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, nome: "Cúbiculo 1", tipo: "CUBICULO", capacidade: 2, posicaoX: -8, posicaoZ: -4 },
    }),
    prisma.sala.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, nome: "Cúbiculo 2", tipo: "CUBICULO", capacidade: 2, posicaoX: -4, posicaoZ: -4 },
    }),
    prisma.sala.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, nome: "Cúbiculo 3", tipo: "CUBICULO", capacidade: 2, posicaoX: 0, posicaoZ: -4 },
    }),
    prisma.sala.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, nome: "Cúbiculo 4", tipo: "CUBICULO", capacidade: 2, posicaoX: 4, posicaoZ: -4 },
    }),
    prisma.sala.upsert({
      where: { id: 5 },
      update: {},
      create: { id: 5, nome: "Cúbiculo 5", tipo: "CUBICULO", capacidade: 2, posicaoX: 8, posicaoZ: -4 },
    }),
    // Cúbiculos - Fileira 2 (fundo)
    prisma.sala.upsert({
      where: { id: 6 },
      update: {},
      create: { id: 6, nome: "Cúbiculo 6", tipo: "CUBICULO", capacidade: 2, posicaoX: -8, posicaoZ: 4 },
    }),
    prisma.sala.upsert({
      where: { id: 7 },
      update: {},
      create: { id: 7, nome: "Cúbiculo 7", tipo: "CUBICULO", capacidade: 2, posicaoX: -4, posicaoZ: 4 },
    }),
    prisma.sala.upsert({
      where: { id: 8 },
      update: {},
      create: { id: 8, nome: "Cúbiculo 8", tipo: "CUBICULO", capacidade: 2, posicaoX: 0, posicaoZ: 4 },
    }),
    prisma.sala.upsert({
      where: { id: 9 },
      update: {},
      create: { id: 9, nome: "Cúbiculo 9", tipo: "CUBICULO", capacidade: 2, posicaoX: 4, posicaoZ: 4 },
    }),
    prisma.sala.upsert({
      where: { id: 10 },
      update: {},
      create: { id: 10, nome: "Cúbiculo 10", tipo: "CUBICULO", capacidade: 2, posicaoX: 8, posicaoZ: 4 },
    }),
    // Sala de Reunião
    prisma.sala.upsert({
      where: { id: 11 },
      update: {},
      create: { id: 11, nome: "Sala de Reuniões", tipo: "REUNIAO", capacidade: 12, posicaoX: -12, posicaoZ: 0 },
    }),
    // Copa / Café
    prisma.sala.upsert({
      where: { id: 12 },
      update: {},
      create: { id: 12, nome: "Copa / Café", tipo: "CAFE", capacidade: 8, posicaoX: 12, posicaoZ: 0 },
    }),
  ]);

  console.log(`✅ ${salas.length} salas criadas`);

  // ── Criar Usuários de Teste ──────────────────────────────────
  const usuarios = await Promise.all([
    prisma.usuario.upsert({
      where: { email: "ana.silva@empresa.com" },
      update: {},
      create: { nome: "Ana Silva", email: "ana.silva@empresa.com", idCubiculoPadrao: 1 },
    }),
    prisma.usuario.upsert({
      where: { email: "bruno.costa@empresa.com" },
      update: {},
      create: { nome: "Bruno Costa", email: "bruno.costa@empresa.com", idCubiculoPadrao: 2 },
    }),
    prisma.usuario.upsert({
      where: { email: "carla.oliveira@empresa.com" },
      update: {},
      create: { nome: "Carla Oliveira", email: "carla.oliveira@empresa.com", idCubiculoPadrao: 3 },
    }),
    prisma.usuario.upsert({
      where: { email: "diego.santos@empresa.com" },
      update: {},
      create: { nome: "Diego Santos", email: "diego.santos@empresa.com", idCubiculoPadrao: 4 },
    }),
    prisma.usuario.upsert({
      where: { email: "elena.lima@empresa.com" },
      update: {},
      create: { nome: "Elena Lima", email: "elena.lima@empresa.com", idCubiculoPadrao: 5 },
    }),
  ]);

  console.log(`✅ ${usuarios.length} usuários criados`);
  console.log("\n🎉 Seed concluído com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
