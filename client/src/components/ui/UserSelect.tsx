"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

interface UserSelectProps {
  onSelectUser: (user: { id: number; name: string; avatar?: string }) => void;
}

export default function UserSelect({ onSelectUser }: UserSelectProps) {
  const { data: session, status } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Se logou com sucesso, sincroniza com o nosso backend
    if (status === "authenticated" && session?.user?.email && !isSyncing) {
      setIsSyncing(true);
      
      const syncUser = async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
          const response = await fetch(`${API_URL}/api/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: session.user?.name || "Usuário Anônimo",
              email: session.user?.email,
              avatar: session.user?.image || null
            }),
          });

          if (!response.ok) {
            throw new Error("Erro ao sincronizar usuário no backend");
          }

          const usuario = await response.json();
          // Notificar o Ponto de Entrada (App) com os dados sincronizados
          onSelectUser({ id: usuario.id, name: usuario.nome, avatar: usuario.avatar });
        } catch (err) {
          console.error("Falha ao sincronizar", err);
          setIsSyncing(false);
        }
      };

      syncUser();
    }
  }, [status, session, onSelectUser, isSyncing]);

  if (status === "loading" || isSyncing) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy-950)" }}>
        <p style={{ color: "var(--ink-400)", fontFamily: "var(--font-mono)" }}>
          {status === "loading" ? "VERIFICANDO CREDENCIAIS..." : "SINCRONIZANDO ESCRITÓRIO..."}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--navy-950)",
      }}
      className="blueprint-field animate-fade-in"
    >
      <div
        className="glass-elevated bracketed"
        style={{
          width: "100%",
          maxWidth: 440,
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <svg viewBox="0 0 240 240" style={{ width: 64, height: 64, margin: "0 auto 24px" }}>
            <polygon points="40,60 120,90 120,180 40,150" fill="var(--navy-700)" stroke="var(--cyan)" strokeWidth="3" strokeOpacity="0.6"/>
            <polygon points="120,90 200,60 200,150 120,180" fill="var(--navy-500)" stroke="var(--cyan)" strokeWidth="3" strokeOpacity="0.9"/>
            <line x1="120" y1="90" x2="120" y2="180" stroke="var(--cyan)" strokeWidth="3"/>
            <circle cx="120" cy="76" r="16" fill="var(--amber)" className="animate-pulse-glow" style={{ filter: "drop-shadow(0 0 12px rgba(242,163,59,0.5))" }}/>
            <circle cx="120" cy="76" r="6" fill="var(--amber-light)"/>
          </svg>
          
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "32px", color: "var(--ink-50)", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
            <span style={{ color: "var(--amber)" }}>V</span>office
          </h1>
          <p style={{ color: "var(--ink-400)", fontSize: "15px", marginTop: "12px", maxWidth: 280, margin: "12px auto 0" }}>
            O escritório da sua equipe, renderizado em tempo real.
          </p>
        </div>

        <div className="kicker" style={{ alignSelf: "flex-start", marginBottom: "20px" }}>
          Acesso Restrito
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
          <button 
            className="btn-primary" 
            onClick={() => signIn("github")}
            style={{ justifyContent: "center", padding: "14px", fontSize: "15px", background: "#24292e", border: "none" }}
          >
            Entrar com GitHub
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={() => signIn("google")}
            style={{ justifyContent: "center", padding: "14px", fontSize: "15px", background: "white", color: "#333", border: "none" }}
          >
            Entrar com Google
          </button>
        </div>
      </div>
    </div>
  );
}
