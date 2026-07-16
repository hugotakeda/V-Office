"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSocket } from "@/hooks/useSocket";
import Toolbar from "@/components/ui/Toolbar";
import InviteModal from "@/components/ui/InviteModal";
import UserSelect from "@/components/ui/UserSelect";
import GlobalChat from "@/components/ui/GlobalChat";
import JitsiRoom from "@/components/JitsiRoom";

// Importar Scene3D dinamicamente (sem SSR) pois usa WebGL
const Scene3D = dynamic(() => import("@/components/Scene3D"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--navy-950)",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "3px solid var(--navy-800)",
          borderTopColor: "var(--cyan)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <p style={{ color: "var(--ink-400)", fontSize: 14, fontFamily: "var(--font-mono)" }}>
        CARREGANDO AMBIENTE 3D...
      </p>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  ),
});

// ── Mapeamento Usuário → Cúbiculo Padrão ───────────────────────

const USER_DEFAULT_CUBICLE: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
};

const ROOM_NAMES: Record<number, string> = {
  1: "C-01",
  2: "C-02",
  3: "C-03",
  4: "C-04",
  5: "C-05",
  6: "C-06",
  7: "C-07",
  8: "C-08",
  9: "C-09",
  10: "C-10",
  11: "SR-01",
  12: "CP-01",
};

// ── Página Principal ───────────────────────────────────────────

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const {
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
  } = useSocket(currentUser?.id ?? null, currentUser?.name ?? null);

  const onlineUsers = useMemo(
    () => officeState?.onlineUsers ?? [],
    [officeState]
  );

  // ── Handlers ─────────────────────────────────────────────────

  const handleUserSelect = useCallback((user: { id: number; name: string }) => {
    setCurrentUser(user);
  }, []);

  const handleRoomClick = useCallback(
    (roomId: number) => {
      if (!currentUser) return;
      joinRoom(roomId);
    },
    [currentUser, joinRoom]
  );

  const handleGoToMyCubicle = useCallback(() => {
    if (!currentUser) return;
    joinEmptyCubicle();
  }, [currentUser, joinEmptyCubicle]);

  const handleInviteUser = useCallback(
    (toUserId: number) => {
      if (!currentUser || !currentRoom) {
        alert("Você precisa estar em uma sala para convidar alguém.");
        return;
      }
      const roomName = ROOM_NAMES[currentRoom] || `Sala ${currentRoom}`;
      inviteUser(toUserId, currentRoom, roomName);
    },
    [currentUser, currentRoom, inviteUser]
  );

  const handleLogout = useCallback(() => {
    if (currentRoom) leaveRoom();
    setCurrentUser(null);
  }, [currentRoom, leaveRoom]);

  // ── Render ───────────────────────────────────────────────────

  if (!currentUser) {
    return <UserSelect onSelectUser={handleUserSelect} />;
  }

  return (
    <main style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* ── Cena 3D (fundo) ─────────────────────────────────── */}
      <Scene3D
        onRoomClick={handleRoomClick}
        onlineUsers={onlineUsers}
        currentUserId={currentUser.id}
        currentRoom={currentRoom}
      />

      {/* ── Overlay Escuro quando no Jitsi ──────────────────── */}
      {currentRoom && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10, 21, 32, 0.4)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}

      {/* ── Toolbar (overlay principal) ─────────────────────── */}
      <Toolbar
        isConnected={isConnected}
        currentUser={currentUser}
        currentRoom={currentRoom}
        onlineUsers={onlineUsers}
        onGoToMyCubicle={handleGoToMyCubicle}
        onLeaveRoom={leaveRoom}
        onInviteUser={handleInviteUser}
        onLogout={handleLogout}
      />

      {/* ── Painel de Vídeo (Jitsi) ─────────────────────────── */}
      {currentRoom && (
        <JitsiRoom
          roomId={currentRoom}
          roomName={ROOM_NAMES[currentRoom] || `Sala ${currentRoom}`}
          userName={currentUser.name}
          onClose={leaveRoom}
        />
      )}

      {/* ── Chat Global ─────────────────────────────────────── */}
      <GlobalChat
        messages={messages}
        onSendMessage={sendChatMessage}
        currentUser={currentUser}
      />

      {/* ── Modal de Convite ────────────────────────────────── */}
      {pendingInvite && (
        <InviteModal
          inviterName={pendingInvite.fromUserName}
          roomName={pendingInvite.roomName}
          onAccept={() => respondToInvite(true)}
          onDecline={() => respondToInvite(false)}
        />
      )}

      {/* ── Instruções iniciais (somente no lobby) ──────────── */}
      {!currentRoom && (
        <div
          className="glass bracketed animate-fade-in"
          style={{
            position: "fixed",
            bottom: 100,
            left: 32,
            zIndex: 40,
            padding: "20px 24px",
            maxWidth: 320,
          }}
        >
          <div className="kicker" style={{ marginBottom: 12 }}>Navegação</div>
          <div
            style={{
              fontSize: 14,
              color: "var(--ink-400)",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "var(--ink-50)", fontWeight: 600 }}>Planta Baixa Interativa</strong>
            <br />
            • Clique em qualquer sala para entrar
            <br />
            • Arraste com o mouse para mover (pan)
            <br />
            • Use o scroll para zoom
          </div>
        </div>
      )}
    </main>
  );
}
