"use client";

import { useEffect, useState } from "react";

interface PontoModalProps {
  userId: number;
  onClose: () => void;
}

interface PontoData {
  totalFormatado: string;
  totalMinutos: number;
  sessoes: Array<{
    id: number;
    dataHoraEntrada: string;
    dataHoraSaida: string | null;
    sala: { nome: string; tipo: string };
  }>;
}

export default function PontoModal({ userId, onClose }: PontoModalProps) {
  const [data, setData] = useState<PontoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${API_URL}/api/ponto/${userId}/today`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [userId]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 21, 32, 0.8)",
        backdropFilter: "blur(4px)",
      }}
      className="animate-fade-in"
    >
      <div
        className="glass-elevated bracketed"
        style={{
          width: "100%",
          maxWidth: 500,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          padding: "32px",
          background: "var(--navy-900)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--ink-50)", fontSize: 24 }}>
            Meu Ponto (Hoje)
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--ink-400)", cursor: "pointer", fontSize: 20 }}>
            ✕
          </button>
        </div>

        {isLoading ? (
          <div style={{ color: "var(--ink-400)", textAlign: "center", padding: "40px 0" }}>Carregando dados...</div>
        ) : !data ? (
          <div style={{ color: "var(--coral)", textAlign: "center", padding: "40px 0" }}>Erro ao carregar os dados do ponto.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, overflowY: "auto", paddingRight: 8 }}>
            <div style={{ background: "var(--navy-800)", padding: 20, borderRadius: 4, borderLeft: "4px solid var(--cyan)" }}>
              <p style={{ color: "var(--ink-200)", fontSize: 13, textTransform: "uppercase" }}>Tempo Total Hoje</p>
              <p style={{ color: "var(--cyan)", fontSize: 32, fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: 4 }}>
                {data.totalFormatado}
              </p>
            </div>

            <div>
              <h3 style={{ color: "var(--ink-200)", fontSize: 14, marginBottom: 12, textTransform: "uppercase", borderBottom: "1px solid var(--navy-700)", paddingBottom: 8 }}>
                Histórico de Salas
              </h3>
              
              {data.sessoes.length === 0 ? (
                <p style={{ color: "var(--ink-400)", fontSize: 14 }}>Nenhum registro encontrado hoje.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.sessoes.map((sessao) => {
                    const entrada = new Date(sessao.dataHoraEntrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const saida = sessao.dataHoraSaida ? new Date(sessao.dataHoraSaida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Agora";
                    
                    return (
                      <div key={sessao.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--navy-950)", padding: "12px 16px", borderRadius: 4, border: "1px solid var(--navy-800)" }}>
                        <div>
                          <div style={{ color: "var(--ink-50)", fontWeight: 600, fontSize: 14 }}>{sessao.sala.nome}</div>
                          <div style={{ color: "var(--ink-400)", fontSize: 12, marginTop: 2 }}>{sessao.sala.tipo}</div>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)", fontSize: 13, background: "rgba(86, 194, 230, 0.1)", padding: "4px 8px", borderRadius: 4 }}>
                          {entrada} - {saida}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
