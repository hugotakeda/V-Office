"use client";

import { useMemo } from "react";
import { Grid } from "@react-three/drei";
import * as THREE from "three";

export default function OfficeFloor() {
  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#0E1D2B",
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);

  return (
    <group>
      {/* ── Chão principal (Blueprint Navy) ───────────────── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <primitive object={floorMaterial} />
      </mesh>

      {/* ── Grid Blueprint (cyanotype) ────────────────────── */}
      <Grid
        position={[0, 0.005, 0]}
        args={[200, 200]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#1E3A4F"
        sectionSize={4}
        sectionThickness={0.8}
        sectionColor="#56C2E6"
        fadeDistance={50}
        fadeStrength={1.5}
        infiniteGrid={true}
      />

      {/* ── Paredes externas (navy-800) ───────────────────── */}
      {/* Frontal */}
      <mesh position={[0, 1.5, -15]}>
        <boxGeometry args={[50, 3, 0.15]} />
        <meshStandardMaterial color="#14283A" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      {/* Traseira */}
      <mesh position={[0, 1.5, 15]}>
        <boxGeometry args={[50, 3, 0.15]} />
        <meshStandardMaterial color="#14283A" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      {/* Esquerda */}
      <mesh position={[-25, 1.5, 0]}>
        <boxGeometry args={[0.15, 3, 30]} />
        <meshStandardMaterial color="#14283A" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      {/* Direita */}
      <mesh position={[25, 1.5, 0]}>
        <boxGeometry args={[0.15, 3, 30]} />
        <meshStandardMaterial color="#14283A" roughness={0.9} transparent opacity={0.7} />
      </mesh>

      {/* ── Luminárias de teto (mais claras) ──────────────── */}
      {[-8, -4, 0, 4, 8].map((x) =>
        [-6, 0, 6].map((z) => (
          <group key={`light-${x}-${z}`} position={[x, 3.9, z]}>
            <mesh>
              <boxGeometry args={[1.2, 0.04, 0.15]} />
              <meshStandardMaterial
                color="#C3D2DD"
                emissive="#C3D2DD"
                emissiveIntensity={0.4}
              />
            </mesh>
            <pointLight
              color="#EEF3F7"
              intensity={0.25}
              distance={8}
              decay={2}
            />
          </group>
        ))
      )}
    </group>
  );
}
