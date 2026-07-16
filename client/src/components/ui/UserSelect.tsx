"use client";

import { useState } from "react";

interface UserSelectProps {
  onSelectUser: (user: { id: number; name: string }) => void;
}

export default function UserSelect({ onSelectUser }: UserSelectProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setError("Por favor, preencha nome e email.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar usuário");
      }

      const usuario = await response.json();
      onSelectUser({ id: usuario.id, name: usuario.nome });
    } catch (err) {
      setError("Falha ao conectar com o servidor.");
      setIsLoading(false);
    }
  };

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
          Identificação
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div style={{ color: "var(--coral)", fontSize: "14px", background: "rgba(232, 105, 122, 0.1)", padding: "10px", borderRadius: "3px", border: "1px solid var(--coral)", textAlign: "center" }}>
              {error}
            </div>
          )}
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", color: "var(--ink-200)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
              disabled={isLoading}
              style={{
                background: "var(--navy-900)",
                border: "1px solid var(--navy-700)",
                padding: "12px 16px",
                borderRadius: "3px",
                color: "var(--ink-50)",
                fontSize: "15px",
                fontFamily: "var(--font-sans)",
                outline: "none",
                width: "100%",
                transition: "all 0.2s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--cyan)"}
              onBlur={(e) => e.target.style.borderColor = "var(--navy-700)"}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", color: "var(--ink-200)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>E-mail Profissional</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: joao@empresa.com"
              disabled={isLoading}
              style={{
                background: "var(--navy-900)",
                border: "1px solid var(--navy-700)",
                padding: "12px 16px",
                borderRadius: "3px",
                color: "var(--ink-50)",
                fontSize: "15px",
                fontFamily: "var(--font-sans)",
                outline: "none",
                width: "100%",
                transition: "all 0.2s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--cyan)"}
              onBlur={(e) => e.target.style.borderColor = "var(--navy-700)"}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
            style={{ marginTop: "8px", justifyContent: "center", padding: "14px", fontSize: "15px" }}
          >
            {isLoading ? "Entrando..." : "Entrar no Escritório"}
          </button>
        </form>
      </div>
    </div>
  );
}
