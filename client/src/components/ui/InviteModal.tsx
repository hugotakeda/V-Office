"use client";

interface InviteModalProps {
  inviterName: string;
  roomName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function InviteModal({
  inviterName,
  roomName,
  onAccept,
  onDecline,
}: InviteModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(10, 21, 32, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="animate-fade-in"
    >
      <div
        className="glass-elevated bracketed"
        style={{
          width: "100%",
          maxWidth: 380,
          padding: "24px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div className="status-dot occupied animate-pulse-glow" />
          <strong style={{ color: "var(--ink-50)", fontSize: "15px", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            {inviterName}
          </strong>
        </div>
        
        <p style={{ fontSize: "15px", color: "var(--ink-200)", marginBottom: "24px", lineHeight: 1.5 }}>
          {inviterName} está te chamando para a sala <strong style={{ color: "var(--cyan)", fontFamily: "var(--font-mono)" }}>{roomName}</strong>.
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-primary" onClick={onAccept} style={{ flex: 1, justifyContent: "center" }}>
            Aceitar convite
          </button>
          <button className="btn-ghost" onClick={onDecline} style={{ flex: 1, justifyContent: "center" }}>
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}
