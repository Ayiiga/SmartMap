"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
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

function Starfield() {
  const points = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const r = 400 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.6} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

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

function planetScale(zoomLevel: number, baseSize: number): number {
  const boost = Math.pow(1.65, Math.max(0, zoomLevel - 3));
  return Math.max(1.2, baseSize * boost);
}

function SolarSystemScene({
  observer,
  zoomLevel,
  showOrbits,
  focusId,
  onSelect,
}: {
  observer: ObserverContext;
  zoomLevel: number;
  showOrbits: boolean;
  focusId: string | null;
  onSelect: (obj: AstronomicalObject, position: THREE.Vector3) => void;
}) {
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

  const showNearbyStars = zoomLevel >= 7;
  const showDeepSpace = zoomLevel >= 9;

  return (
    <group>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#fbbf24" />
      <Starfield />

      {Object.entries(PLANET_VISUAL).map(([id, visual]) => {
        const pos = planetPositions[id];
        if (!pos) return null;
        const scaled = planetScale(zoomLevel, visual.size);

        return (
          <group key={id} position={pos}>
            {showOrbits && id !== "sun" && id !== "moon" && PLANET_ORBIT_AU[id] && (
              <OrbitRing radius={PLANET_ORBIT_AU[id] * AU_SCALE} visible />
            )}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelect(
                  {
                    id,
                    name: visual.label,
                    type: id === "moon" ? "moon" : id === "sun" ? "sun" : "planet",
                    offlineAvailable: true,
                    requiresLiveData: true,
                    description: "Tap to learn more — ephemeris-calculated position.",
                  },
                  new THREE.Vector3(...pos),
                );
              }}
            >
              <sphereGeometry args={[scaled, 32, 32]} />
              <meshStandardMaterial
                color={visual.color}
                emissive={id === "sun" ? visual.color : "#000000"}
                emissiveIntensity={id === "sun" ? 1.2 : 0}
              />
            </mesh>
            {id === "saturn" && (
              <mesh rotation={[Math.PI / 2.5, 0, 0]}>
                <ringGeometry args={[scaled * 1.4, scaled * 2, 64]} />
                <meshBasicMaterial color="#fcd34d" transparent opacity={0.6} side={THREE.DoubleSide} />
              </mesh>
            )}
            <Text position={[0, scaled + 1.5, 0]} fontSize={1.8} color="#e2e8f0" anchorX="center">
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
    </group>
  );
}

function CameraRig({
  zoomLevel,
  reducedMotion,
  focusId,
  focusPosition,
  onZoomChange,
}: {
  zoomLevel: number;
  reducedMotion: boolean;
  focusId: string | null;
  focusPosition: THREE.Vector3 | null;
  onZoomChange: (level: number) => void;
}) {
  const controlsRef = useRef<import("three-stdlib").OrbitControls | null>(null);
  const { camera } = useThree();
  const lastDist = useRef(120);

  const targetDistance = useMemo(() => {
    const base = 180;
    const factor = Math.pow(0.55, zoomLevel - 4);
    return Math.max(8, Math.min(900, base * factor));
  }, [zoomLevel]);

  useEffect(() => {
    if (!focusPosition || !controlsRef.current) return;
    controlsRef.current.target.copy(focusPosition);
    camera.position.set(
      focusPosition.x,
      focusPosition.y + targetDistance * 0.15,
      focusPosition.z + targetDistance * 0.35,
    );
    controlsRef.current.update();
  }, [focusId, focusPosition, camera, targetDistance]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const dist = camera.position.distanceTo(controls.target);
    if (Math.abs(dist - lastDist.current) > 2) {
      lastDist.current = dist;
      const level = 4 + Math.log2(180 / Math.max(8, dist));
      const clamped = Math.max(0, Math.min(10, Math.round(level)));
      if (clamped !== zoomLevel) onZoomChange(clamped);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom
      enableRotate
      minDistance={6}
      maxDistance={950}
      rotateSpeed={reducedMotion ? 0.3 : 0.5}
      zoomSpeed={reducedMotion ? 0.6 : 1.2}
      makeDefault
      target={focusPosition ?? [0, 0, 0]}
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
  const setZoomLevel = useSpaceCamStore((s) => s.setZoomLevel);
  const layers = useSpaceCamStore((s) => s.layers);
  const reducedMotion = useSpaceCamStore((s) => s.reducedMotion);
  const setSelectedObject = useSpaceCamStore((s) => s.setSelectedObject);

  const [focusId, setFocusId] = useState<string | null>(null);
  const [focusPosition, setFocusPosition] = useState<THREE.Vector3 | null>(null);
  const lastTapRef = useRef(0);
  const pinchRef = useRef<{ dist: number; level: number } | null>(null);

  const handleSelect = useCallback(
    (obj: AstronomicalObject, position: THREE.Vector3) => {
      const now = Date.now();
      if (now - lastTapRef.current < 350) {
        setFocusId(obj.id);
        setFocusPosition(position.clone());
        setZoomLevel(Math.min(10, zoomLevel + 2) as typeof zoomLevel);
      }
      lastTapRef.current = now;
      setSelectedObject(obj);
    },
    [setSelectedObject, setZoomLevel, zoomLevel],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current = { dist: Math.hypot(dx, dy), level: zoomLevel };
      }
    },
    [zoomLevel],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchRef.current.dist;
      const delta = Math.log2(ratio) * 1.5;
      const next = Math.max(0, Math.min(10, Math.round(pinchRef.current.level + delta)));
      if (next !== zoomLevel) setZoomLevel(next as typeof zoomLevel);
    },
    [setZoomLevel, zoomLevel],
  );

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchRef.current = null;
    if (e.touches.length === 2 && e.timeStamp - lastTapRef.current < 400) {
      setFocusId(null);
      setFocusPosition(null);
      setZoomLevel(3);
      lastTapRef.current = 0;
    }
  }, [setZoomLevel]);

  return (
    <div
      className={className}
      role="img"
      aria-label="3D space visualization"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Canvas
        camera={{ position: [0, 60, 120], fov: 55 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <SolarSystemScene
          observer={observer}
          zoomLevel={zoomLevel}
          showOrbits={layers.orbits}
          focusId={focusId}
          onSelect={handleSelect}
        />
        <CameraRig
          zoomLevel={zoomLevel}
          reducedMotion={reducedMotion}
          focusId={focusId}
          focusPosition={focusPosition}
          onZoomChange={(level) => setZoomLevel(level as typeof zoomLevel)}
        />
      </Canvas>
    </div>
  );
}
