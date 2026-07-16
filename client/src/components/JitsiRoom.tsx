"use client";

import { useEffect, useRef, useState } from "react";

// ── Tipos ──────────────────────────────────────────────────────

interface JitsiRoomProps {
  roomId: number;
  roomName: string;
  userName: string;
  onClose: () => void;
  onJoined?: () => void;
  onLeft?: () => void;
}

// ── Mapeamento de sala para nome Jitsi ─────────────────────────

function getJitsiRoomName(roomId: number): string {
  return `voffice-sala-${roomId}-${Date.now().toString(36).slice(-4)}`;
}

// Guardar nomes de sala persistentes por sessão
const roomNameCache = new Map<number, string>();
function getOrCreateJitsiRoom(roomId: number): string {
  if (!roomNameCache.has(roomId)) {
    roomNameCache.set(roomId, `voffice-sala-${roomId}`);
  }
  return roomNameCache.get(roomId)!;
}

// ── Componente JitsiRoom ───────────────────────────────────────

export default function JitsiRoom({
  roomId,
  roomName,
  userName,
  onClose,
  onJoined,
  onLeft,
}: JitsiRoomProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para Drag & Drop
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPositionRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPositionRef.current = { ...position };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: initialPositionRef.current.x + dx,
      y: initialPositionRef.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    // Carregar script do Jitsi Meet External API
    const loadJitsiScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if ((window as any).JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Falha ao carregar Jitsi Meet API"));
        document.body.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!jitsiContainerRef.current) return;

        const jitsiRoomName = getOrCreateJitsiRoom(roomId);

        const api = new (window as any).JitsiMeetExternalAPI("meet.jit.si", {
          roomName: jitsiRoomName,
          parentNode: jitsiContainerRef.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName: userName,
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            toolbarButtons: [
              "microphone",
              "camera",
              "desktop",
              "chat",
              "fullscreen",
              "raisehand",
              "tileview",
              "hangup",
            ],
            hideConferenceSubject: true,
            hideConferenceTimer: true,
            disableProfile: true,
            enableWelcomePage: false,
            enableClosePage: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "chat",
              "fullscreen",
              "raisehand",
              "tileview",
              "hangup",
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DEFAULT_BACKGROUND: "#0E1D2B",
            TOOLBAR_ALWAYS_VISIBLE: true,
            FILM_STRIP_MAX_HEIGHT: 120,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            HIDE_INVITE_MORE_HEADER: true,
          },
        });

        apiRef.current = api;

        // ── Eventos do Jitsi ────────────────────────────────
        api.addEventListener("videoConferenceJoined", () => {
          console.log("🎥 Jitsi: Conectado à sala de vídeo");
          setIsLoading(false);
          onJoined?.();
        });

        api.addEventListener("videoConferenceLeft", () => {
          console.log("🎥 Jitsi: Saiu da sala de vídeo");
          onLeft?.();
        });

        api.addEventListener("readyToClose", () => {
          console.log("🎥 Jitsi: Pronto para fechar");
          onClose();
        });

        // Timeout de segurança para loading
        setTimeout(() => {
          setIsLoading(false);
        }, 8000);
      } catch (err) {
        console.error("❌ Erro ao inicializar Jitsi:", err);
        setError("Não foi possível carregar o Jitsi Meet. Verifique sua conexão.");
        setIsLoading(false);
      }
    };

    initJitsi();

    // Cleanup
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomId, userName, onClose, onJoined, onLeft]);

  return (
    <div
      className="jitsi-overlay animate-fade-in"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isDragging ? "none" : "transform 0.1s ease-out",
        boxShadow: isDragging 
          ? "-12px 16px 50px rgba(0, 0, 0, 0.6)" 
          : "-4px 8px 30px rgba(0, 0, 0, 0.5)"
      }}
    >
      {/* ── Header (Área de Arrastar) ─────────────────────── */}
      <div
        className="jitsi-overlay-header"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            className="status-dot occupied"
            style={{ width: 8, height: 8 }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--cyan)",
              }}
            >
              Sala Ativa
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--ink-50)",
              }}
            >
              {roomName}
            </div>
          </div>
        </div>

        <button
          className="btn-danger"
          onClick={onClose}
          style={{ padding: "8px 16px", fontSize: 13 }}
        >
          ✕ Sair
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="jitsi-overlay-body">
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              background: "var(--navy-900)",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid var(--navy-700)",
                borderTopColor: "var(--cyan)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p
              style={{
                color: "var(--ink-400)",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
              }}
            >
              Conectando ao vídeo...
            </p>
            <style jsx>{`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        )}

        {error && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              background: "var(--navy-900)",
              padding: 32,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40 }}>⚠️</div>
            <p style={{ color: "var(--coral)", fontSize: 14 }}>{error}</p>
            <button className="btn-secondary" onClick={onClose}>
              Voltar
            </button>
          </div>
        )}

        <div
          ref={jitsiContainerRef}
          style={{
            width: "100%",
            height: "100%",
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
