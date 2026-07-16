"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

// ── Tipos ──────────────────────────────────────────────────────

export interface OnlineUser {
  userId: number;
  userName: string;
  currentRoomId: number | null;
}

export interface OfficeState {
  rooms: Record<string, any[]>;
  onlineUsers: OnlineUser[];
}

export interface InviteData {
  fromUserId: number;
  fromUserName: string;
  roomId: number;
  roomName: string;
}

export interface ChatMessage {
  userId: number;
  userName: string;
  text: string;
  timestamp: string;
}

// ── Audio ──────────────────────────────────────────────────────
function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
}

// ── Hook ───────────────────────────────────────────────────────

export function useSocket(userId: number | null, userName: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [officeState, setOfficeState] = useState<OfficeState | null>(null);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);
  const [pendingInvite, setPendingInvite] = useState<InviteData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Conectar ao servidor
  useEffect(() => {
    if (!userId || !userName) return;

    const socket = connectSocket();
    socketRef.current = socket;

    // ── Event Listeners ────────────────────────────────────
    socket.on("connect", () => {
      console.log("🔌 Conectado ao servidor Socket.io");
      setIsConnected(true);
      socket.emit("user:connect", { userId, userName });
    });

    socket.on("disconnect", () => {
      console.log("🔌 Desconectado do servidor");
      setIsConnected(false);
    });

    socket.on("user:connected", (data: { success: boolean }) => {
      if (data.success) {
        console.log("👤 Identificação confirmada");
      }
    });

    socket.on("office:state", (state: OfficeState) => {
      setOfficeState(state);
    });

    socket.on("room:joined", (data: { success: boolean; roomId: number; roomName: string }) => {
      if (data.success) {
        setCurrentRoom(data.roomId);
        console.log(`🚪 Entrou na sala: ${data.roomName}`);
      }
    });

    socket.on("room:left", (data: { success: boolean; roomId: number }) => {
      if (data.success) {
        setCurrentRoom(null);
        console.log("🚶 Saiu da sala");
      }
    });

    socket.on("room:invite-received", (invite: InviteData) => {
      console.log(`📨 Convite recebido de ${invite.fromUserName}`);
      setPendingInvite(invite);
      playNotificationSound();
    });

    socket.on("room:user-entered", (data: { userName: string; roomId: number }) => {
      console.log(`👋 ${data.userName} entrou na sala`);
    });

    socket.on("room:user-left", (data: { userName: string; roomId: number }) => {
      console.log(`👋 ${data.userName} saiu da sala`);
    });

    socket.on("chat:receive", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // ── Cleanup ────────────────────────────────────────────
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("user:connected");
      socket.off("office:state");
      socket.off("room:joined");
      socket.off("room:left");
      socket.off("room:invite-received");
      socket.off("room:user-entered");
      socket.off("room:user-left");
      socket.off("chat:receive");
      disconnectSocket();
    };
  }, [userId, userName]);

  // ── Ações ────────────────────────────────────────────────────

  const joinRoom = useCallback((roomId: number) => {
    const socket = getSocket();
    if (socket.connected && userId) {
      socket.emit("room:join", { userId, roomId });
    }
  }, [userId]);

  const joinEmptyCubicle = useCallback(() => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("room:join-empty-cubicle");
    }
  }, []);

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("room:leave");
    }
  }, []);

  const inviteUser = useCallback(
    (toUserId: number, roomId: number, roomName: string) => {
      const socket = getSocket();
      if (socket.connected && userId && userName) {
        socket.emit("room:invite", {
          fromUserId: userId,
          fromUserName: userName,
          toUserId,
          roomId,
          roomName,
        });
      }
    },
    [userId, userName]
  );

  const respondToInvite = useCallback(
    (accepted: boolean) => {
      if (!pendingInvite) return;
      const socket = getSocket();
      if (socket.connected) {
        socket.emit("room:invite-response", {
          accepted,
          fromUserId: pendingInvite.fromUserId,
          roomId: pendingInvite.roomId,
        });
        if (accepted) {
          joinRoom(pendingInvite.roomId);
        }
        setPendingInvite(null);
      }
    },
    [pendingInvite, joinRoom]
  );

  const sendChatMessage = useCallback((text: string) => {
    const socket = getSocket();
    if (socket.connected && text.trim()) {
      socket.emit("chat:send", { text: text.trim() });
    }
  }, []);

  return {
    isConnected,
    officeState,
    currentRoom,
    pendingInvite,
    joinRoom,
    joinEmptyCubicle,
    leaveRoom,
    inviteUser,
    respondToInvite,
    messages,
    sendChatMessage,
  };
}
