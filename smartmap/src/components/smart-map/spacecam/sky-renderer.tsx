"use client";

import { useMemo, useRef, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { BRIGHT_STARS, CONSTELLATIONS, getStarById } from "@/lib/spacecam/astronomy/catalog";
import { equatorialToVector } from "@/lib/spacecam/astronomy/coordinates";
import { getAllPlanetPositions } from "@/lib/spacecam/astronomy/ephemeris";
import { useSpaceCamStore } from "@/lib/spacecam/spacecam-store";
import type { ObserverContext } from "@/lib/spacecam/astronomy/types";
import type { AstronomicalObject } from "@/lib/spacecam/astronomy/types";

const SPHERE_RADIUS = 500;

function InstancedStarField({
  showLabels,
  onSelect,
}: {
  showLabels: boolean;
  onSelect: (obj: AstronomicalObject) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const stars = useMemo(() => BRIGHT_STARS.filter((s) => s.raHours != null), []);

  const positions = useMemo(() => {
    return stars.map((star) => {
      const [x, y, z] = equatorialToVector(star.raHours!, star.decDeg!);
      return new THREE.Vector3(x * SPHERE_RADIUS, y * SPHERE_RADIUS, z * SPHERE_RADIUS);
    });
  }, [stars]);

  useMemo(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      const mag = stars[i].magnitude ?? 5;
      const scale = Math.max(0.3, 3 - mag * 0.5);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      const brightness = Math.max(0.3, 1 - (mag + 1) / 8);
      color.setRGB(brightness, brightness, Math.min(1, brightness + 0.1));
      meshRef.current!.setColorAt(i, color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [positions, stars]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, stars.length]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {showLabels &&
        stars
          .filter((s) => (s.magnitude ?? 5) < 2)
          .map((star) => {
            const [x, y, z] = equatorialToVector(star.raHours!, star.decDeg!);
            return (
              <Text
                key={star.id}
                position={[x * SPHERE_RADIUS * 1.02, y * SPHERE_RADIUS * 1.02, z * SPHERE_RADIUS * 1.02]}
                fontSize={4}
                color="#e2e8f0"
                anchorX="center"
                anchorY="middle"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(star);
                }}
              >
                {star.name}
              </Text>
            );
          })}
    </group>
  );
}

function ConstellationLines({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <group>
      {CONSTELLATIONS.map((con) => {
        const points: THREE.Vector3[] = [];
        for (const [fromId, toId] of con.lines) {
          const from = getStarById(fromId);
          const to = getStarById(toId);
          if (!from?.raHours || !to?.raHours) continue;
          const [fx, fy, fz] = equatorialToVector(from.raHours, from.decDeg!);
          const [tx, ty, tz] = equatorialToVector(to.raHours, to.decDeg!);
          points.push(
            new THREE.Vector3(fx * SPHERE_RADIUS, fy * SPHERE_RADIUS, fz * SPHERE_RADIUS),
            new THREE.Vector3(tx * SPHERE_RADIUS, ty * SPHERE_RADIUS, tz * SPHERE_RADIUS),
          );
        }
        if (points.length < 2) return null;
        return (
          <Line
            key={con.id}
            points={points}
            color="#60a5fa"
            opacity={0.5}
            transparent
            lineWidth={1}
          />
        );
      })}
    </group>
  );
}

function PlanetMarkers({
  observer,
  layers,
  onSelect,
}: {
  observer: ObserverContext;
  layers: { planets: boolean; moon: boolean };
  onSelect: (obj: AstronomicalObject) => void;
}) {
  const positions = useMemo(() => getAllPlanetPositions(observer.date), [observer.date]);

  const planetColors: Record<string, string> = {
    sun: "#fbbf24",
    mercury: "#a8a29e",
    venus: "#fde68a",
    moon: "#e2e8f0",
    mars: "#f87171",
    jupiter: "#f59e0b",
    saturn: "#fcd34d",
    uranus: "#67e8f9",
    neptune: "#3b82f6",
  };

  return (
    <group>
      {positions.map((pos) => {
        if (pos.objectId === "moon" && !layers.moon) return null;
        if (pos.objectId !== "moon" && pos.objectId !== "sun" && !layers.planets) return null;
        if (pos.objectId === "sun" && !layers.planets) return null;

        const [x, y, z] = equatorialToVector(pos.raHours, pos.decDeg);
        const size = pos.objectId === "sun" ? 12 : pos.objectId === "moon" ? 5 : 6;
        const color = planetColors[pos.objectId] ?? "#ffffff";

        return (
          <mesh
            key={pos.objectId}
            position={[x * SPHERE_RADIUS * 0.98, y * SPHERE_RADIUS * 0.98, z * SPHERE_RADIUS * 0.98]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect({
                id: pos.objectId,
                name: pos.objectId.charAt(0).toUpperCase() + pos.objectId.slice(1),
                type: pos.objectId === "moon" ? "moon" : pos.objectId === "sun" ? "sun" : "planet",
                raHours: pos.raHours,
                decDeg: pos.decDeg,
                magnitude: pos.magnitude,
                distanceAu: pos.distanceAu,
                offlineAvailable: true,
                requiresLiveData: true,
              });
            }}
          >
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function HorizonRing() {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * SPHERE_RADIUS, 0, Math.sin(angle) * SPHERE_RADIUS));
    }
    return pts;
  }, []);

  return <Line points={points} color="#334155" opacity={0.6} transparent lineWidth={1} />;
}

function EclipticLine({ visible }: { visible: boolean }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const ra = (i / 64) * 24;
      const [x, y, z] = equatorialToVector(ra, 0);
      pts.push(new THREE.Vector3(x * SPHERE_RADIUS * 0.95, y * SPHERE_RADIUS * 0.95, z * SPHERE_RADIUS * 0.95));
    }
    return pts;
  }, []);

  if (!visible) return null;
  return <Line points={points} color="#a78bfa" opacity={0.3} transparent lineWidth={1} />;
}

function MilkyWayBand({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <mesh rotation={[0, 0, Math.PI / 6]}>
      <ringGeometry args={[SPHERE_RADIUS * 0.7, SPHERE_RADIUS * 0.85, 64]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.08} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SkyScene({
  observer,
  layers,
  zoomLevel,
  onSelect,
}: {
  observer: ObserverContext;
  layers: ReturnType<typeof useSpaceCamStore.getState>["layers"];
  zoomLevel: number;
  onSelect: (obj: AstronomicalObject) => void;
}) {
  const showLabels = zoomLevel >= 2;

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.15} />
      {layers.milkyWay && <MilkyWayBand visible />}
      {layers.stars && <InstancedStarField showLabels={showLabels} onSelect={onSelect} />}
      {layers.constellations && <ConstellationLines visible />}
      {(layers.planets || layers.moon) && (
        <PlanetMarkers observer={observer} layers={layers} onSelect={onSelect} />
      )}
      <HorizonRing />
      {layers.grid && <EclipticLine visible />}
      <Stars radius={SPHERE_RADIUS * 1.5} depth={50} count={2000} factor={2} saturation={0} fade speed={0.5} />
    </>
  );
}

function CameraController({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.setLength(Math.max(50, 200));
  });
  return (
    <OrbitControls
      enablePan
      enableZoom
      enableRotate
      minDistance={30}
      maxDistance={SPHERE_RADIUS * 0.9}
      rotateSpeed={reducedMotion ? 0.3 : 0.6}
      zoomSpeed={reducedMotion ? 0.5 : 1}
      makeDefault
    />
  );
}

export function SkyRenderer({
  observer,
  className,
}: {
  observer: ObserverContext;
  className?: string;
}) {
  const layers = useSpaceCamStore((s) => s.layers);
  const zoomLevel = useSpaceCamStore((s) => s.zoomLevel);
  const reducedMotion = useSpaceCamStore((s) => s.reducedMotion);
  const setSelectedObject = useSpaceCamStore((s) => s.setSelectedObject);

  const handleSelect = useCallback(
    (obj: AstronomicalObject) => setSelectedObject(obj),
    [setSelectedObject],
  );

  return (
    <div className={className} role="img" aria-label="Interactive sky map visualization">
      <Canvas
        camera={{ position: [0, 50, 200], fov: 60, near: 1, far: SPHERE_RADIUS * 3 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <SkyScene observer={observer} layers={layers} zoomLevel={zoomLevel} onSelect={handleSelect} />
        <CameraController reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
