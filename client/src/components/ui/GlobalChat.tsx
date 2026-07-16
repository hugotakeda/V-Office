"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/hooks/useSocket";

interface GlobalChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: { id: number; name: string };
}

export default function GlobalChat({
  messages,
  onSendMessage,
  currentUser,
}: GlobalChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const lastMessagesLength = useRef(messages.length);

  // Auto-scroll para a última mensagem e controle de lidas
  useEffect(() => {
    if (messages.length > lastMessagesLength.current) {
      if (!isOpen) {
        setUnreadCount((prev) => prev + (messages.length - lastMessagesLength.current));
      }
    }
    lastMessagesLength.current = messages.length;

    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Zerar mensagens não lidas ao abrir
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText("");
    }
  };

  return (
    <>
      {/* ── Botão Flutuante (abre o chat) ───────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 45,
        }}
      >
        <button
          className="btn-secondary"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "relative",
            width: 56,
            height: 56,
            borderRadius: "50%",
            padding: 0,
            justifyContent: "center",
            boxShadow: isOpen ? "none" : "var(--shadow-glow-cyan)",
            background: isOpen ? "var(--navy-800)" : "var(--navy-900)",
          }}
        >
          <span style={{ fontSize: 24 }}>{isOpen ? "✕" : "💬"}</span>
          {unreadCount > 0 && !isOpen && (
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "var(--coral)",
                color: "var(--ink-50)",
                fontSize: 12,
                fontWeight: 800,
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 10px rgba(232, 105, 122, 0.6)",
                fontFamily: "var(--font-sans)",
                animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </button>
      </div>

      {/* ── Janela do Chat ──────────────────────────────────────── */}
      {isOpen && (
        <div
          className="glass-elevated bracketed animate-slide-up"
          style={{
            position: "fixed",
            bottom: 100,
            right: 32,
            width: 340,
            height: 480,
            zIndex: 45,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "-4px 12px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--navy-700)",
              background: "rgba(10, 21, 32, 0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div className="kicker" style={{ margin: 0 }}>
              Chat Global
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-400)" }}>
              {messages.length} msg
            </div>
          </div>

          {/* Área de Mensagens */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              background: "rgba(14, 29, 43, 0.6)",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  margin: "auto",
                  color: "var(--ink-600)",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Nenhuma mensagem ainda.
                <br />
                Diga um olá para o escritório!
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.userId === currentUser.id;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: isMe ? "var(--cyan)" : "var(--ink-400)",
                          fontWeight: 600,
                        }}
                      >
                        {isMe ? "Você" : msg.userName}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--navy-500)" }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      style={{
                        background: isMe ? "var(--navy-600)" : "var(--navy-800)",
                        color: "var(--ink-50)",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        borderTopRightRadius: isMe ? 2 : 8,
                        borderTopLeftRadius: !isMe ? 2 : 8,
                        fontSize: 14,
                        lineHeight: 1.4,
                        maxWidth: "90%",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "16px",
              borderTop: "1px solid var(--navy-700)",
              background: "rgba(10, 21, 32, 0.95)",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite aqui..."
              style={{
                flex: 1,
                background: "var(--navy-950)",
                border: "1px solid var(--navy-700)",
                borderRadius: "3px",
                padding: "10px 14px",
                color: "var(--ink-50)",
                outline: "none",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
              }}
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="btn-primary"
              style={{ padding: "0 16px" }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
