"use client";

import { useState } from "react";
import type { OnlineUser } from "@/hooks/useSocket";

interface ToolbarProps {
  isConnected: boolean;
  currentUser: { id: number; name: string; avatar?: string } | null;
  currentRoom: number | null;
  onlineUsers: OnlineUser[];
  onGoToMyCubicle: () => void;
  onLeaveRoom: () => void;
  onInviteUser: (userId: number) => void;
  onOpenPonto?: () => void;
  onLogout: () => void;
}

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

export default function Toolbar({
  isConnected,
  currentUser,
  currentRoom,
  onlineUsers,
  onGoToMyCubicle,
  onLeaveRoom,
  onInviteUser,
  onOpenPonto,
  onLogout,
}: ToolbarProps) {
  const [showUsers, setShowUsers] = useState(false);

  const otherUsers = onlineUsers.filter(
    (u) => u.userId !== currentUser?.id
  );

  return (
    <>
      {/* ── Barra Superior VOFFICE ─────────────────────────── */}
      <header className="topbar animate-slide-down" style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        background: "rgba(10, 21, 32, 0.86)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--navy-800)",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg viewBox="0 0 240 240" style={{ width: 24, height: 24 }}>
            <polygon points="40,60 120,90 120,180 40,150" fill="var(--navy-700)" stroke="var(--cyan)" strokeWidth="4" strokeOpacity="0.6"/>
            <polygon points="120,90 200,60 200,150 120,180" fill="var(--navy-500)" stroke="var(--cyan)" strokeWidth="4" strokeOpacity="0.9"/>
            <line x1="120" y1="90" x2="120" y2="180" stroke="var(--cyan)" strokeWidth="4"/>
            <circle cx="120" cy="76" r="16" fill="var(--amber)" style={{ filter: "drop-shadow(0 0 8px rgba(242,163,59,0.5))" }}/>
            <circle cx="120" cy="76" r="6" fill="var(--amber-light)"/>
          </svg>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", color: "var(--ink-50)", letterSpacing: "-0.01em" }}>
            Voffice
          </span>
        </div>

        {/* Central Status Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className={`status-dot ${isConnected ? 'available' : 'meeting'}`} />
            <span style={{ fontSize: "13px", color: "var(--ink-400)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
              {isConnected ? "Sistema Online" : "Desconectado"}
            </span>
          </div>

          <div style={{ width: 1, height: 20, background: "var(--navy-800)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--ink-400)" }}>
            <span>👥</span>
            <span>{onlineUsers.length} ONLINE</span>
          </div>

          {currentRoom && (
            <>
              <div style={{ width: 1, height: 20, background: "var(--navy-800)" }} />
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                background: "var(--cyan-faint)",
                border: "1px solid var(--navy-700)",
                borderRadius: "3px",
              }}>
                <div className="status-dot occupied" style={{ width: 6, height: 6 }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--cyan)", fontWeight: 600 }}>
                  {ROOM_NAMES[currentRoom] || `Sala ${currentRoom}`}
                </span>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        {currentUser && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "var(--ink-200)", fontWeight: 500 }}>
              {currentUser.name}
            </span>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--navy-800)",
              border: "1px solid var(--navy-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--cyan)",
              fontFamily: "var(--font-display)",
              overflow: "hidden"
            }}>
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Barra de Ações (inferior) VOFFICE ──────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none", // para não bloquear cliques no chão 3D
        }}
      >
        <div
          className="glass-elevated bracketed animate-slide-up"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 24px",
            pointerEvents: "auto", // reativar cliques apenas nos botões
          }}
        >
          <button className="btn-primary" onClick={onGoToMyCubicle}>
            Ir pro meu cubículo
          </button>

          <button className="btn-secondary" onClick={() => setShowUsers(!showUsers)}>
            Chamar colega pra sala
          </button>

          <button className="btn-ghost" onClick={onOpenPonto}>
            Ver meu Ponto
          </button>

          {currentRoom && (
            <button className="btn-ghost" onClick={onLeaveRoom}>
              Sair da sala
            </button>
          )}

          <div style={{ width: 1, height: 24, background: "var(--navy-700)", margin: "0 8px" }} />

          <button className="btn-ghost" onClick={onLogout} style={{ color: "var(--coral)" }}>
            Sair do escritório
          </button>
        </div>
      </div>

      {/* ── Dropdown de Usuários ───────────────────────────── */}
      {showUsers && (
        <div
          className="glass-elevated bracketed animate-slide-up"
          style={{
            position: "fixed",
            bottom: 100,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 55,
            padding: "24px",
            minWidth: 320,
          }}
        >
          <div className="kicker" style={{ marginBottom: "16px" }}>
            Convidar colega
          </div>

          <div style={{ maxHeight: 260, overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
            {otherUsers.length === 0 ? (
              <div style={{ fontSize: "14px", color: "var(--ink-400)", textAlign: "center", padding: "16px 0" }}>
                Nenhum outro usuário online.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {otherUsers.map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => {
                      onInviteUser(user.userId);
                      setShowUsers(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      border: "1px solid var(--navy-800)",
                      background: "var(--navy-900)",
                      color: "var(--ink-200)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderRadius: 4,
                      textAlign: "left",
                      width: "100%",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--cyan)";
                      (e.currentTarget as HTMLElement).style.background = "var(--navy-800)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--navy-800)";
                      (e.currentTarget as HTMLElement).style.background = "var(--navy-900)";
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--navy-800)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--ink-400)",
                      fontWeight: 600,
                      fontSize: "14px"
                    }}>
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--ink-50)" }}>
                        {user.userName}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--ink-400)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                        {user.currentRoomId
                          ? `SALA: ${ROOM_NAMES[user.currentRoomId] || user.currentRoomId}`
                          : "NO LOBBY"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
