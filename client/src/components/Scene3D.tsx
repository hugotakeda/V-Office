"use client";

import { Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls, Stars, Sparkles } from "@react-three/drei";
import Cubicle from "./Cubicle";
import SpecialRoom from "./SpecialRoom";
import OfficeFloor from "./OfficeFloor";
import type { OnlineUser } from "@/hooks/useSocket";

// ── Tipos ──────────────────────────────────────────────────────

interface Scene3DProps {
  onRoomClick: (roomId: number) => void;
  onlineUsers: OnlineUser[];
  currentUserId: number | null;
  currentRoom: number | null;
}

// ── Layout dos Cúbiculos ───────────────────────────────────────
// 2 fileiras de 5, espaçadas uniformemente

const CUBICLE_LAYOUT: Array<{
  id: number;
  label: string;
  code: string;
  position: [number, number, number];
}> = [
  // Fileira 1 (frente, z negativo)
  { id: 1, label: "Cúbiculo 1", code: "C-01", position: [-8, 0, -5] },
  { id: 2, label: "Cúbiculo 2", code: "C-02", position: [-4, 0, -5] },
  { id: 3, label: "Cúbiculo 3", code: "C-03", position: [0, 0, -5] },
  { id: 4, label: "Cúbiculo 4", code: "C-04", position: [4, 0, -5] },
  { id: 5, label: "Cúbiculo 5", code: "C-05", position: [8, 0, -5] },
  // Fileira 2 (fundo, z positivo)
  { id: 6, label: "Cúbiculo 6", code: "C-06", position: [-8, 0, 5] },
  { id: 7, label: "Cúbiculo 7", code: "C-07", position: [-4, 0, 5] },
  { id: 8, label: "Cúbiculo 8", code: "C-08", position: [0, 0, 5] },
  { id: 9, label: "Cúbiculo 9", code: "C-09", position: [4, 0, 5] },
  { id: 10, label: "Cúbiculo 10", code: "C-10", position: [8, 0, 5] },
];

// ── Loading Fallback ───────────────────────────────────────────

function LoadingFallback() {
  return (
    <mesh position={[0, 1, 0]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial
        color="#56C2E6"
        emissive="#56C2E6"
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

// ── Componente da Cena ─────────────────────────────────────────

export default function Scene3D({
  onRoomClick,
  onlineUsers,
  currentUserId,
  currentRoom,
}: Scene3DProps) {
  // Listar todos os ocupantes de um cúbiculo
  const getOccupants = useCallback(
    (roomId: number): OnlineUser[] => {
      return onlineUsers.filter((u) => u.currentRoomId === roomId);
    },
    [onlineUsers]
  );

  const getOccupantCount = useCallback(
    (roomId: number): number => {
      return onlineUsers.filter((u) => u.currentRoomId === roomId).length;
    },
    [onlineUsers]
  );

  return (
    <div className="canvas-container" id="office-3d-scene">
      <Canvas
        orthographic
        camera={{
          position: [0, 30, 0.1],
          zoom: 28,
          near: 0.1,
          far: 100,
          up: [0, 1, 0],
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        {/* ── Iluminação (mais clara) ──────────────────────── */}
        <ambientLight intensity={0.7} color="#C3D2DD" />
        <directionalLight
          position={[10, 20, 5]}
          intensity={0.8}
          color="#EEF3F7"
        />
        <directionalLight
          position={[-8, 15, -5]}
          intensity={0.4}
          color="#56C2E6"
        />
        <hemisphereLight args={["#2A4A61", "#0E1D2B", 0.5]} />

        <Suspense fallback={<LoadingFallback />}>
          {/* ── Chão do Escritório ──────────────────────────── */}
          <OfficeFloor />

          {/* ── Cúbiculos ──────────────────────────────────── */}
          {CUBICLE_LAYOUT.map((cubicle) => {
            const occupants = getOccupants(cubicle.id);
            const isOccupied = occupants.length > 0;
            const isCurrentUser = occupants.some(u => u.userId === currentUserId);
            return (
              <Cubicle
                key={cubicle.id}
                roomId={cubicle.id}
                label={cubicle.code}
                position={cubicle.position}
                isOccupied={isOccupied}
                isCurrentUser={isCurrentUser}
                occupants={occupants.map(u => u.userName)}
                onClick={onRoomClick}
              />
            );
          })}

          {/* ── Sala de Reuniões ────────────────────────────── */}
          <SpecialRoom
            roomId={11}
            label="SR-01"
            type="reuniao"
            position={[-16, 0, 0]}
            occupants={getOccupants(11).map(u => u.userName)}
            occupantCount={getOccupantCount(11)}
            capacity={12}
            onClick={onRoomClick}
          />

          {/* ── Copa / Café ────────────────────────────────── */}
          <SpecialRoom
            roomId={12}
            label="CP-01"
            type="cafe"
            position={[16, 0, 0]}
            occupants={getOccupants(12).map(u => u.userName)}
            occupantCount={getOccupantCount(12)}
            capacity={8}
            onClick={onRoomClick}
          />
        </Suspense>

        {/* ── Controles: Pan + Zoom, sem rotação ──────────── */}
        <MapControls
          enableRotate={false}
          enableZoom={true}
          enablePan={true}
          minZoom={22}
          maxZoom={60}
          zoomSpeed={1.2}
          panSpeed={1.5}
          dampingFactor={0.1}
          enableDamping
        />
      </Canvas>
    </div>
  );
}
