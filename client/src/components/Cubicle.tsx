"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// ── Tipos ──────────────────────────────────────────────────────

interface CubicleProps {
  position: [number, number, number];
  roomId: number;
  label: string;
  occupants?: string[];
  isOccupied?: boolean;
  isCurrentUser?: boolean;
  onClick?: (roomId: number) => void;
}

// ── VOFFICE Cores ──────────────────────────────────────────────

const COLORS = {
  desk: "#3C607A",
  deskTop: "#2A4A61",
  monitor: "#14283A",
  monitorScreen: "#56C2E6",
  monitorScreenOff: "#1E3A4F",
  chair: "#1E3A4F",
  chairSeat: "#2A4A61",
  partition: "#56C2E6",
  partitionFrame: "#3C607A",
  plant: "#5FCFA0",
  plantPot: "#92400e",
  keyboard: "#14283A",
  // Status system from brand guide
  available: "#5FCFA0",    // mint
  occupied: "#F2A33B",     // amber
  currentUser: "#56C2E6",  // cyan
  hovered: "#56C2E6",      // cyan
  meeting: "#E8697A",      // coral
};

// ── Componente Cúbiculo ────────────────────────────────────────

export default function Cubicle({
  position,
  roomId,
  label,
  occupants = [],
  isOccupied = false,
  isCurrentUser = false,
  onClick,
}: CubicleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const monitorLightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  // Determinar cor do status (brand guide)
  const statusColor = useMemo(() => {
    if (isCurrentUser) return COLORS.currentUser;
    if (hovered) return COLORS.hovered;
    if (isOccupied) return COLORS.occupied;
    return COLORS.available;
  }, [isCurrentUser, isOccupied, hovered]);

  // Animação sutil
  useFrame((state) => {
    if (!groupRef.current) return;

    if (hovered) {
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.02;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        position[1],
        0.1
      );
    }

    // Pulsar a luz do monitor quando ocupado
    if (monitorLightRef.current && isOccupied) {
      monitorLightRef.current.intensity =
        0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.(roomId);
  };

  const handlePointerEnter = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerLeave = () => {
    setHovered(false);
    document.body.style.cursor = "default";
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* ── Base / Chão do cúbiculo ────────────────────────── */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.6, 3.6]} />
        <meshStandardMaterial
          color={hovered ? "#1E3A4F" : "#0E1D2B"}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* ── Divisórias (3 paredes) — cyan stroke ──────────── */}
      {/* Parede traseira */}
      <RoundedBox
        args={[3.6, 2.2, 0.08]}
        radius={0.02}
        position={[0, 1.1, -1.8]}
      >
        <meshStandardMaterial
          color={COLORS.partition}
          transparent
          opacity={0.12}
          roughness={0.8}
        />
      </RoundedBox>
      {/* Frame da parede traseira */}
      <mesh position={[0, 2.2, -1.8]}>
        <boxGeometry args={[3.6, 0.05, 0.1]} />
        <meshStandardMaterial
          color={COLORS.partitionFrame}
          metalness={0.4}
        />
      </mesh>

      {/* Parede esquerda */}
      <RoundedBox
        args={[0.08, 2.2, 3.6]}
        radius={0.02}
        position={[-1.8, 1.1, 0]}
      >
        <meshStandardMaterial
          color={COLORS.partition}
          transparent
          opacity={0.10}
          roughness={0.8}
        />
      </RoundedBox>

      {/* Parede direita */}
      <RoundedBox
        args={[0.08, 2.2, 3.6]}
        radius={0.02}
        position={[1.8, 1.1, 0]}
      >
        <meshStandardMaterial
          color={COLORS.partition}
          transparent
          opacity={0.10}
          roughness={0.8}
        />
      </RoundedBox>

      {/* ── Mesa ──────────────────────────────────────────── */}
      <RoundedBox
        args={[2.8, 0.08, 1.4]}
        radius={0.02}
        position={[0, 0.75, -0.6]}
      >
        <meshStandardMaterial
          color={COLORS.deskTop}
          roughness={0.4}
          metalness={0.2}
        />
      </RoundedBox>
      <mesh position={[-1.2, 0.375, -0.6]}>
        <boxGeometry args={[0.06, 0.75, 1.2]} />
        <meshStandardMaterial color={COLORS.desk} metalness={0.3} />
      </mesh>
      <mesh position={[1.2, 0.375, -0.6]}>
        <boxGeometry args={[0.06, 0.75, 1.2]} />
        <meshStandardMaterial color={COLORS.desk} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.375, -1.2]}>
        <boxGeometry args={[2.46, 0.75, 0.04]} />
        <meshStandardMaterial color={COLORS.desk} roughness={0.6} />
      </mesh>

      {/* ── Monitor ──────────────────────────────────────── */}
      <RoundedBox
        args={[1.2, 0.7, 0.04]}
        radius={0.02}
        position={[0, 1.2, -1.0]}
      >
        <meshStandardMaterial
          color={COLORS.monitor}
          roughness={0.2}
          metalness={0.6}
        />
      </RoundedBox>
      <mesh position={[0, 1.2, -0.97]}>
        <planeGeometry args={[1.05, 0.58]} />
        <meshStandardMaterial
          color={isOccupied ? COLORS.monitorScreen : COLORS.monitorScreenOff}
          emissive={isOccupied ? COLORS.monitorScreen : COLORS.monitorScreenOff}
          emissiveIntensity={isOccupied ? 0.8 : 0.1}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.9, -1.0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.3, 8]} />
        <meshStandardMaterial color="#3C607A" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.78, -1.0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
        <meshStandardMaterial color="#3C607A" metalness={0.7} />
      </mesh>

      <pointLight
        ref={monitorLightRef}
        position={[0, 1.2, -0.7]}
        color={isOccupied ? COLORS.monitorScreen : COLORS.monitorScreenOff}
        intensity={isOccupied ? 0.5 : 0.05}
        distance={3}
        decay={2}
      />

      {/* ── Teclado ──────────────────────────────────────── */}
      <RoundedBox
        args={[0.8, 0.02, 0.3]}
        radius={0.01}
        position={[0, 0.8, -0.35]}
      >
        <meshStandardMaterial color={COLORS.keyboard} roughness={0.4} metalness={0.3} />
      </RoundedBox>

      {/* ── Mouse ────────────────────────────────────────── */}
      <mesh position={[0.6, 0.8, -0.35]}>
        <capsuleGeometry args={[0.03, 0.04, 4, 8]} />
        <meshStandardMaterial color={COLORS.keyboard} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* ── Cadeira ──────────────────────────────────────── */}
      <mesh position={[0, 0.48, 0.4]}>
        <cylinderGeometry args={[0.35, 0.35, 0.06, 16]} />
        <meshStandardMaterial color={COLORS.chairSeat} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.25, 0.4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
        <meshStandardMaterial color="#14283A" metalness={0.8} />
      </mesh>
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((angle * Math.PI) / 180) * 0.25,
            0.05,
            Math.cos((angle * Math.PI) / 180) * 0.25 + 0.4,
          ]}
          rotation={[0, (angle * Math.PI) / 180, 0]}
        >
          <boxGeometry args={[0.04, 0.04, 0.3]} />
          <meshStandardMaterial color="#14283A" metalness={0.7} />
        </mesh>
      ))}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <mesh
          key={`wheel-${i}`}
          position={[
            Math.sin((angle * Math.PI) / 180) * 0.38,
            0.03,
            Math.cos((angle * Math.PI) / 180) * 0.38 + 0.4,
          ]}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#0A1520" metalness={0.5} />
        </mesh>
      ))}
      <RoundedBox
        args={[0.55, 0.6, 0.06]}
        radius={0.05}
        position={[0, 0.85, 0.7]}
      >
        <meshStandardMaterial color={COLORS.chair} roughness={0.8} />
      </RoundedBox>

      {/* ── Planta decorativa ────────────────────────────── */}
      <mesh position={[1.1, 0.82, -0.9]}>
        <cylinderGeometry args={[0.08, 0.06, 0.1, 8]} />
        <meshStandardMaterial color={COLORS.plantPot} roughness={0.8} />
      </mesh>
      <mesh position={[1.1, 0.95, -0.9]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={COLORS.plant} roughness={0.9} />
      </mesh>
      <mesh position={[1.05, 1.0, -0.85]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#4aba8a" roughness={0.9} />
      </mesh>

      {/* ── Caneca ───────────────────────────────────────── */}
      <mesh position={[-0.8, 0.82, -0.4]}>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 8]} />
        <meshStandardMaterial color="#EEF3F7" roughness={0.4} />
      </mesh>

      {/* ── Nó de Presença (status LED) ──────────────────── */}
      <mesh position={[1.6, 2.15, -1.75]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={hovered ? 2.5 : 1.5}
        />
      </mesh>
      <pointLight
        position={[1.6, 2.15, -1.75]}
        color={statusColor}
        intensity={0.4}
        distance={2.5}
        decay={2}
      />

      {/* ── Label HTML (VOFFICE style) ───────────────────── */}
      <Html
        position={[0, 2.8, 0]}
        center
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={{
            background: "rgba(10, 21, 32, 0.92)",
            backdropFilter: "blur(8px)",
            padding: "6px 14px",
            borderRadius: "3px",
            border: `1px solid ${statusColor}50`,
            textAlign: "center",
            whiteSpace: "nowrap",
            boxShadow: `0 0 12px ${statusColor}25`,
            transition: "all 0.3s ease",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#EEF3F7",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.08em",
            }}
          >
            {label}
          </div>
          {occupants.length > 0 && (
            <div
              style={{
                fontSize: "10px",
                color: statusColor,
                marginTop: "2px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                display: "flex",
                flexDirection: "column",
                gap: "1px",
              }}
            >
              {occupants.slice(0, 2).map((name, idx) => (
                <div key={idx}>{name}</div>
              ))}
              {occupants.length > 2 && (
                <div style={{ opacity: 0.8 }}>+{occupants.length - 2} pessoa(s)</div>
              )}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
