"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface SpecialRoomProps {
  roomId: number;
  label: string;
  type: "reuniao" | "cafe";
  position: [number, number, number];
  occupants?: string[];
  occupantCount: number;
  capacity: number;
  onClick?: (roomId: number) => void;
}

// ── VOFFICE Cores ──────────────────────────────────────────────

const COLORS = {
  floor: "#0E1D2B",
  wall: "#14283A",
  wallGlass: "#56C2E6",
  accent: "#2A4A61",
  furniturePrimary: "#3C607A",
  furnitureSecondary: "#1E3A4F",
  // Status system
  available: "#5FCFA0", // mint
  meeting: "#E8697A",   // coral
  hovered: "#56C2E6",   // cyan
};

export default function SpecialRoom({
  roomId,
  label,
  type,
  position,
  occupants = [],
  occupantCount,
  capacity,
  onClick,
}: SpecialRoomProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const isOccupied = occupantCount > 0;
  
  // Status color based on occupancy and room type
  const statusColor = useMemo(() => {
    if (hovered) return COLORS.hovered;
    if (isOccupied && type === "reuniao") return COLORS.meeting;
    if (isOccupied) return COLORS.available; // People in cafe doesn't mean "meeting"
    return COLORS.available;
  }, [hovered, isOccupied, type]);

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

  // Renderização condicional dos móveis baseada no tipo
  const renderFurniture = () => {
    if (type === "reuniao") {
      return (
        <group position={[0, 0, 0]}>
          {/* Mesa de reunião grande */}
          <RoundedBox args={[3.5, 0.1, 1.8]} radius={0.05} position={[0, 0.8, 0]}>
            <meshStandardMaterial color={COLORS.furniturePrimary} roughness={0.3} />
          </RoundedBox>
          <mesh position={[-1.2, 0.4, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
            <meshStandardMaterial color={COLORS.furnitureSecondary} />
          </mesh>
          <mesh position={[1.2, 0.4, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
            <meshStandardMaterial color={COLORS.furnitureSecondary} />
          </mesh>

          {/* Tela de apresentação */}
          <mesh position={[0, 1.5, -2.4]}>
            <boxGeometry args={[3, 1.6, 0.1]} />
            <meshStandardMaterial color="#0A1520" />
          </mesh>
          <mesh position={[0, 1.5, -2.34]}>
            <planeGeometry args={[2.8, 1.4]} />
            <meshStandardMaterial
              color={isOccupied ? "#56C2E6" : "#14283A"}
              emissive={isOccupied ? "#56C2E6" : "#14283A"}
              emissiveIntensity={isOccupied ? 0.6 : 0.1}
            />
          </mesh>

          {/* Cadeiras (representação simplificada ao redor da mesa) */}
          {[-1.2, 0, 1.2].map((x, i) => (
            <group key={`chair-top-${i}`}>
              <mesh position={[x, 0.5, -1.2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
                <meshStandardMaterial color={COLORS.accent} />
              </mesh>
            </group>
          ))}
          {[-1.2, 0, 1.2].map((x, i) => (
            <group key={`chair-bot-${i}`}>
              <mesh position={[x, 0.5, 1.2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
                <meshStandardMaterial color={COLORS.accent} />
              </mesh>
            </group>
          ))}
        </group>
      );
    } else {
      return (
        <group position={[0, 0, 0]}>
          {/* Balcão */}
          <mesh position={[-1.5, 0.6, -1.5]}>
            <boxGeometry args={[2.5, 1.2, 0.8]} />
            <meshStandardMaterial color={COLORS.furniturePrimary} />
          </mesh>
          <mesh position={[-1.5, 1.25, -1.5]}>
            <boxGeometry args={[2.6, 0.1, 0.9]} />
            <meshStandardMaterial color={COLORS.accent} />
          </mesh>
          
          {/* Máquina de café */}
          <mesh position={[-2, 1.5, -1.5]}>
            <boxGeometry args={[0.4, 0.5, 0.4]} />
            <meshStandardMaterial color="#14283A" metalness={0.5} />
          </mesh>

          {/* Mesas redondas */}
          {[
            { x: 1.5, z: 1.5 },
            { x: 1.5, z: -1 },
            { x: -1, z: 1.5 },
          ].map((pos, i) => (
            <group key={`table-${i}`} position={[pos.x, 0, pos.z]}>
              <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
                <meshStandardMaterial color={COLORS.furnitureSecondary} />
              </mesh>
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
                <meshStandardMaterial color={COLORS.furniturePrimary} />
              </mesh>
              <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
                <meshStandardMaterial color={COLORS.furniturePrimary} />
              </mesh>
            </group>
          ))}
        </group>
      );
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* ── Chão da Sala ─────────────────────────────────── */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.8, 5.8]} />
        <meshStandardMaterial
          color={hovered ? "#14283A" : "#0E1D2B"}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* ── Paredes (Glass/Cyan style) ───────────────────── */}
      {/* Traseira */}
      <mesh position={[0, 1.5, -2.9]}>
        <boxGeometry args={[7.8, 3, 0.1]} />
        <meshStandardMaterial color={COLORS.wall} transparent opacity={0.6} />
      </mesh>
      {/* Lateral esquerda */}
      <mesh position={[-3.9, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, 5.8]} />
        <meshStandardMaterial color={COLORS.wallGlass} transparent opacity={0.15} roughness={0.2} />
      </mesh>
      {/* Lateral direita */}
      <mesh position={[3.9, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, 5.8]} />
        <meshStandardMaterial color={COLORS.wallGlass} transparent opacity={0.15} roughness={0.2} />
      </mesh>
      {/* Frontal (Vidro com porta aberta) */}
      <mesh position={[-2.4, 1.5, 2.9]}>
        <boxGeometry args={[3, 3, 0.1]} />
        <meshStandardMaterial color={COLORS.wallGlass} transparent opacity={0.15} roughness={0.2} />
      </mesh>
      <mesh position={[2.4, 1.5, 2.9]}>
        <boxGeometry args={[3, 3, 0.1]} />
        <meshStandardMaterial color={COLORS.wallGlass} transparent opacity={0.15} roughness={0.2} />
      </mesh>

      {/* Móveis */}
      {renderFurniture()}

      {/* ── Nó de Presença (Luz de Status) ───────────────── */}
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={isOccupied || hovered ? 2 : 0.5}
        />
      </mesh>
      <pointLight
        position={[0, 3.2, 0]}
        color={statusColor}
        intensity={isOccupied ? 0.8 : 0.2}
        distance={6}
        decay={2}
      />

      {/* ── Label HTML VOFFICE ───────────────────────────── */}
      <Html
        position={[0, 3.8, 0]}
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
            padding: "8px 16px",
            borderRadius: "3px",
            border: `1px solid ${statusColor}50`,
            textAlign: "center",
            boxShadow: `0 0 16px ${statusColor}30`,
            transition: "all 0.3s ease",
            transform: hovered ? "scale(1.1)" : "scale(1)",
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#EEF3F7",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.08em",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: statusColor,
              marginTop: "4px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}
          >
            {type === "reuniao" ? "REUNIÃO" : "COPA"} • {occupantCount}/{capacity}
          </div>
          {occupants.length > 0 && (
            <div
              style={{
                fontSize: "10px",
                color: "var(--ink-400)",
                marginTop: "4px",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                flexDirection: "column",
                gap: "1px",
              }}
            >
              {occupants.slice(0, 3).map((name, idx) => (
                <div key={idx}>{name}</div>
              ))}
              {occupants.length > 3 && (
                <div style={{ opacity: 0.8 }}>+{occupants.length - 3} pessoa(s)</div>
              )}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
