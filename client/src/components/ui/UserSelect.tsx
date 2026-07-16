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
            style={{ justifyContent: "center", padding: "14px", fontSize: "15px", background: "#24292e", border: "none", display: "flex", alignItems: "center" }}
          >
            <svg height="24" viewBox="0 0 16 16" width="24" fill="currentColor" style={{ marginRight: 8 }}><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            Entrar com GitHub
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={() => signIn("google")}
            style={{ justifyContent: "center", padding: "14px", fontSize: "15px", background: "white", color: "#333", border: "none", display: "flex", alignItems: "center", fontWeight: 500 }}
          >
            <svg height="24" viewBox="0 0 24 24" width="24" style={{ marginRight: 8 }}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.01 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            Entrar com Google
          </button>
        </div>
      </div>
    </div>
  );
}
