"use client";

import { useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import {
  getHeliocentricVector,
  getMoonGeocentricVector,
  PLANET_ORBIT_AU,
} from "@/lib/spacecam/astronomy/ephemeris";
import { BRIGHT_STARS } from "@/lib/spacecam/astronomy/catalog";
import { useSpaceCamStore } from "@/lib/spacecam/spacecam-store";
import type { ObserverContext } from "@/lib/spacecam/astronomy/types";
import type { AstronomicalObject } from "@/lib/spacecam/astronomy/types";

const AU_SCALE = 30;

const PLANET_VISUAL: Record<string, { color: string; size: number; label: string }> = {
  sun: { color: "#fbbf24", size: 8, label: "Sun" },
  mercury: { color: "#a8a29e", size: 1.2, label: "Mercury" },
  venus: { color: "#fde68a", size: 2, label: "Venus" },
  earth: { color: "#3b82f6", size: 2.2, label: "Earth" },
  moon: { color: "#cbd5e1", size: 0.6, label: "Moon" },
  mars: { color: "#ef4444", size: 1.5, label: "Mars" },
  jupiter: { color: "#f59e0b", size: 5, label: "Jupiter" },
  saturn: { color: "#fcd34d", size: 4.5, label: "Saturn" },
  uranus: { color: "#67e8f9", size: 3, label: "Uranus" },
  neptune: { color: "#2563eb", size: 3, label: "Neptune" },
};

function OrbitRing({ radius, visible }: { radius: number; visible: boolean }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  if (!visible) return null;
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#334155" transparent opacity={0.4} />
    </line>
  );
}

function SolarSystemScene({
  observer,
  zoomLevel,
  showOrbits,
  onSelect,
}: {
  observer: ObserverContext;
  zoomLevel: number;
  showOrbits: boolean;
  onSelect: (obj: AstronomicalObject) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const planetPositions = useMemo(() => {
    const positions: Record<string, [number, number, number]> = {};
    for (const id of Object.keys(PLANET_ORBIT_AU)) {
      const helio = getHeliocentricVector(id, observer.date);
      if (helio) {
        positions[id] = [helio[0] * AU_SCALE, helio[1] * AU_SCALE, helio[2] * AU_SCALE];
      } else if (id === "earth") {
        positions[id] = [0, 0, 0];
      }
    }
    const moonVec = getMoonGeocentricVector(observer.date);
    positions.moon = [
      (positions.earth?.[0] ?? 0) + moonVec[0] * AU_SCALE * 0.3,
      (positions.earth?.[1] ?? 0) + moonVec[1] * AU_SCALE * 0.3,
      (positions.earth?.[2] ?? 0) + moonVec[2] * AU_SCALE * 0.3,
    ];
    positions.sun = [0, 0, 0];
    return positions;
  }, [observer.date]);

  const showPlanets = zoomLevel >= 3;
  const showNearbyStars = zoomLevel >= 7;
  const showDeepSpace = zoomLevel >= 9;

  return (
    <group ref={groupRef}>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#fbbf24" />

      {showPlanets &&
        Object.entries(PLANET_VISUAL).map(([id, visual]) => {
          const pos = planetPositions[id];
          if (!pos) return null;
          if (zoomLevel < 3 && id !== "earth" && id !== "moon") return null;
          if (zoomLevel < 4 && !["sun", "earth", "moon", "mercury", "venus", "mars"].includes(id)) return null;
          if (zoomLevel < 6 && ["uranus", "neptune"].includes(id)) return null;

          return (
            <group key={id} position={pos}>
              {showOrbits && id !== "sun" && id !== "moon" && PLANET_ORBIT_AU[id] && (
                <OrbitRing radius={PLANET_ORBIT_AU[id] * AU_SCALE} visible />
              )}
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect({
                    id,
                    name: visual.label,
                    type: id === "moon" ? "moon" : id === "sun" ? "sun" : "planet",
                    offlineAvailable: true,
                    requiresLiveData: true,
                    description: "3D visualization using ephemeris-calculated position.",
                  });
                }}
              >
                <sphereGeometry args={[visual.size, 32, 32]} />
                <meshStandardMaterial
                  color={visual.color}
                  emissive={id === "sun" ? visual.color : "#000000"}
                  emissiveIntensity={id === "sun" ? 1 : 0}
                />
              </mesh>
              {id === "saturn" && (
                <mesh rotation={[Math.PI / 2.5, 0, 0]}>
                  <ringGeometry args={[visual.size * 1.4, visual.size * 2, 64]} />
                  <meshBasicMaterial color="#fcd34d" transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
              )}
              <Text position={[0, visual.size + 2, 0]} fontSize={2} color="#e2e8f0" anchorX="center">
                {visual.label}
              </Text>
            </group>
          );
        })}

      {showNearbyStars &&
        BRIGHT_STARS.slice(0, 8).map((star, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const dist = 200 + zoomLevel * 20;
          return (
            <mesh key={star.id} position={[Math.cos(angle) * dist, (Math.random() - 0.5) * 30, Math.sin(angle) * dist]}>
              <sphereGeometry args={[1.5, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          );
        })}

      {showDeepSpace && (
        <group position={[0, 0, -400]}>
          <mesh>
            <sphereGeometry args={[20, 16, 16]} />
            <meshBasicMaterial color="#c084fc" transparent opacity={0.5} />
          </mesh>
          <Text position={[0, 25, 0]} fontSize={3} color="#e9d5ff" anchorX="center">
            Deep Space (Visualization)
          </Text>
        </group>
      )}

      <Stars radius={600} depth={80} count={3000} factor={3} saturation={0} fade speed={0.3} />
    </group>
  );
}

function AnimatedCamera({ reducedMotion }: { zoomLevel: number; reducedMotion: boolean }) {
  return (
    <OrbitControls
      enablePan
      enableZoom
      enableRotate
      minDistance={20}
      maxDistance={800}
      rotateSpeed={reducedMotion ? 0.3 : 0.5}
      zoomSpeed={reducedMotion ? 0.5 : 1}
      makeDefault
      target={[0, 0, 0]}
    />
  );
}

export function SpaceRenderer({
  observer,
  className,
}: {
  observer: ObserverContext;
  className?: string;
}) {
  const zoomLevel = useSpaceCamStore((s) => s.zoomLevel);
  const layers = useSpaceCamStore((s) => s.layers);
  const reducedMotion = useSpaceCamStore((s) => s.reducedMotion);
  const setSelectedObject = useSpaceCamStore((s) => s.setSelectedObject);

  return (
    <div className={className} role="img" aria-label="3D space visualization">
      <Canvas
        camera={{ position: [0, 60, 120], fov: 55 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <SolarSystemScene
          observer={observer}
          zoomLevel={zoomLevel}
          showOrbits={layers.orbits}
          onSelect={setSelectedObject}
        />
        <AnimatedCamera zoomLevel={zoomLevel} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
