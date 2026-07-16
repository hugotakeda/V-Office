import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";

// ── Tipos ──────────────────────────────────────────────────────

interface UserState {
  userId: number;
  userName: string;
  socketId: string;
  currentRoomId: number | null;
  pontoId: number | null;
}

interface JoinRoomPayload {
  userId: number;
  roomId: number;
}

interface InvitePayload {
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  roomId: number;
  roomName: string;
}

interface InviteResponsePayload {
  accepted: boolean;
  fromUserId: number;
  roomId: number;
}

interface ChatMessagePayload {
  userId: number;
  userName: string;
  text: string;
  timestamp: string;
}

// ── Estado em Memória ──────────────────────────────────────────
// Mapeia socketId -> UserState
const connectedUsers = new Map<string, UserState>();
// Mapeia userId -> socketId (lookup reverso)
const userSocketMap = new Map<number, string>();

// ── Helpers ────────────────────────────────────────────────────

function getOfficeState(): Record<string, UserState[]> {
  const state: Record<string, UserState[]> = {};
  connectedUsers.forEach((user) => {
    const roomKey = user.currentRoomId ? `room_${user.currentRoomId}` : "lobby";
    if (!state[roomKey]) state[roomKey] = [];
    state[roomKey].push(user);
  });
  return state;
}

function broadcastOfficeState(io: Server) {
  const state = getOfficeState();
  const onlineUsers = Array.from(connectedUsers.values()).map((u) => ({
    userId: u.userId,
    userName: u.userName,
    currentRoomId: u.currentRoomId,
  }));
  io.emit("office:state", { rooms: state, onlineUsers });
}

// ── Setup Principal ────────────────────────────────────────────

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Socket conectado: ${socket.id}`);

    // ── Usuário se identifica ────────────────────────────────
    socket.on("user:connect", async (data: { userId: number; userName: string }) => {
      const { userId, userName } = data;

      // Se o usuário já estava conectado, limpar conexão anterior
      const existingSocketId = userSocketMap.get(userId);
      if (existingSocketId) {
        connectedUsers.delete(existingSocketId);
      }

      const userState: UserState = {
        userId,
        userName,
        socketId: socket.id,
        currentRoomId: null,
        pontoId: null,
      };

      connectedUsers.set(socket.id, userState);
      userSocketMap.set(userId, socket.id);

      console.log(`👤 ${userName} (ID: ${userId}) conectou-se ao escritório`);

      // Envia estado atual para o novo usuário
      socket.emit("user:connected", { success: true, userId });
      broadcastOfficeState(io);
    });

    // ── Entrar em uma sala ───────────────────────────────────
    socket.on("room:join", async (data: JoinRoomPayload) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const { roomId } = data;

      try {
        // Se estava em outra sala, sair primeiro
        if (user.currentRoomId && user.currentRoomId !== roomId) {
          await handleLeaveRoom(socket, io, user);
        }

        // Registrar entrada no ponto
        const ponto = await prisma.ponto.create({
          data: {
            idUsuario: user.userId,
            idSala: roomId,
          },
        });

        // Atualizar estado
        user.currentRoomId = roomId;
        user.pontoId = ponto.id;

        // Entrar no room do Socket.io (para comunicação direcionada)
        socket.join(`room_${roomId}`);

        // Buscar info da sala
        const sala = await prisma.sala.findUnique({ where: { id: roomId } });

        console.log(`🚪 ${user.userName} entrou na sala: ${sala?.nome || roomId}`);

        socket.emit("room:joined", {
          success: true,
          roomId,
          roomName: sala?.nome,
          pontoId: ponto.id,
        });

        // Notificar outros na sala
        socket.to(`room_${roomId}`).emit("room:user-entered", {
          userId: user.userId,
          userName: user.userName,
          roomId,
        });

        broadcastOfficeState(io);
      } catch (error) {
        console.error("❌ Erro ao entrar na sala:", error);
        socket.emit("room:error", { message: "Erro ao entrar na sala" });
      }
    });

    // ── Entrar no primeiro cúbiculo vazio ────────────────────
    socket.on("room:join-empty-cubicle", async () => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      try {
        // Cúbiculos vão de ID 1 até 10
        let emptyRoomId = null;
        for (let i = 1; i <= 10; i++) {
          const occupantsCount = Array.from(connectedUsers.values()).filter(
            (u) => u.currentRoomId === i
          ).length;
          if (occupantsCount === 0) {
            emptyRoomId = i;
            break;
          }
        }

        if (!emptyRoomId) {
          socket.emit("room:error", { message: "Não há cúbiculos vazios disponíveis." });
          return;
        }

        // Reutilizar a mesma lógica do room:join para processar a entrada
        if (user.currentRoomId && user.currentRoomId !== emptyRoomId) {
          await handleLeaveRoom(socket, io, user);
        }

        const ponto = await prisma.ponto.create({
          data: {
            idUsuario: user.userId,
            idSala: emptyRoomId,
          },
        });

        user.currentRoomId = emptyRoomId;
        user.pontoId = ponto.id;
        socket.join(`room_${emptyRoomId}`);

        const sala = await prisma.sala.findUnique({ where: { id: emptyRoomId } });
        console.log(`🚪 ${user.userName} pegou o cúbiculo vazio: ${sala?.nome || emptyRoomId}`);

        socket.emit("room:joined", {
          success: true,
          roomId: emptyRoomId,
          roomName: sala?.nome,
          pontoId: ponto.id,
        });

        socket.to(`room_${emptyRoomId}`).emit("room:user-entered", {
          userId: user.userId,
          userName: user.userName,
          roomId: emptyRoomId,
        });

        broadcastOfficeState(io);
      } catch (error) {
        console.error("❌ Erro ao encontrar cúbiculo vazio:", error);
        socket.emit("room:error", { message: "Erro ao alocar cúbiculo" });
      }
    });

    // ── Sair de uma sala ─────────────────────────────────────
    socket.on("room:leave", async () => {
      const user = connectedUsers.get(socket.id);
      if (!user || !user.currentRoomId) return;

      await handleLeaveRoom(socket, io, user);
      broadcastOfficeState(io);
    });

    // ── Convidar outro usuário ───────────────────────────────
    socket.on("room:invite", (data: InvitePayload) => {
      const { toUserId, fromUserId, fromUserName, roomId, roomName } = data;

      const targetSocketId = userSocketMap.get(toUserId);
      if (!targetSocketId) {
        socket.emit("room:invite-error", {
          message: "Usuário não está online",
        });
        return;
      }

      console.log(`📨 ${fromUserName} convidou usuário ${toUserId} para sala ${roomName}`);

      // Enviar convite apenas para o usuário alvo
      io.to(targetSocketId).emit("room:invite-received", {
        fromUserId,
        fromUserName,
        roomId,
        roomName,
      });

      socket.emit("room:invite-sent", { success: true, toUserId });
    });

    // ── Resposta ao convite ──────────────────────────────────
    socket.on("room:invite-response", (data: InviteResponsePayload) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const { accepted, fromUserId, roomId } = data;
      const fromSocketId = userSocketMap.get(fromUserId);

      if (fromSocketId) {
        io.to(fromSocketId).emit("room:invite-response-received", {
          accepted,
          fromUserId: user.userId,
          fromUserName: user.userName,
          roomId,
        });
      }

      // Se aceitar, o próprio cliente fará room:join
      console.log(
        `${accepted ? "✅" : "❌"} ${user.userName} ${
          accepted ? "aceitou" : "recusou"
        } o convite para sala ${roomId}`
      );
    });

    // ── Chat Global ──────────────────────────────────────────
    socket.on("chat:send", (data: { text: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const messagePayload: ChatMessagePayload = {
        userId: user.userId,
        userName: user.userName,
        text: data.text,
        timestamp: new Date().toISOString(),
      };

      // Propagar para todos
      io.emit("chat:receive", messagePayload);
    });

    // ── Desconexão ───────────────────────────────────────────
    socket.on("disconnect", async () => {
      const user = connectedUsers.get(socket.id);
      if (!user) {
        console.log(`🔌 Socket desconectado: ${socket.id} (não identificado)`);
        return;
      }

      console.log(`👋 ${user.userName} desconectou-se do escritório`);

      // Se estava em uma sala, registrar saída
      if (user.currentRoomId) {
        await handleLeaveRoom(socket, io, user);
      }

      connectedUsers.delete(socket.id);
      userSocketMap.delete(user.userId);

      broadcastOfficeState(io);
    });
  });

  console.log("⚡ Socket.io handlers configurados");
}

// ── Handler de Saída de Sala ─────────────────────────────────

async function handleLeaveRoom(socket: Socket, io: Server, user: UserState) {
  const roomId = user.currentRoomId;
  if (!roomId) return;

  try {
    // Atualizar ponto com horário de saída
    if (user.pontoId) {
      await prisma.ponto.update({
        where: { id: user.pontoId },
        data: { dataHoraSaida: new Date() },
      });
    }

    const sala = await prisma.sala.findUnique({ where: { id: roomId } });
    console.log(`🚶 ${user.userName} saiu da sala: ${sala?.nome || roomId}`);

    // Notificar outros na sala
    socket.to(`room_${roomId}`).emit("room:user-left", {
      userId: user.userId,
      userName: user.userName,
      roomId,
    });

    socket.leave(`room_${roomId}`);

    // Limpar estado
    user.currentRoomId = null;
    user.pontoId = null;

    socket.emit("room:left", { success: true, roomId });
  } catch (error) {
    console.error("❌ Erro ao sair da sala:", error);
  }
}
