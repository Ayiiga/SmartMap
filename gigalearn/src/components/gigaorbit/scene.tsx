"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { type Mission, SAMPLE_POINTS } from "@/lib/gigaorbit/engine";

function Rocket({ flame = true, lander = false }: { flame?: boolean; lander?: boolean }) {
  const silver = "#c8d6eb";
  return (
    <group>
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[lander ? 0.75 : 0.47, lander ? 0.78 : 0.61, lander ? 1.65 : 3.2, 16]} />
        <meshStandardMaterial color={silver} roughness={0.34} metalness={0.62} />
      </mesh>
      <mesh position={[0, lander ? 1.2 : 2.05, 0]}>
        <coneGeometry args={[lander ? 0.75 : 0.47, lander ? 0.45 : 1.15, 16]} />
        <meshStandardMaterial color={lander ? "#f8fafc" : "#ef7338"} metalness={0.42} roughness={0.26} />
      </mesh>
      <mesh position={[0, 0.65, 0.50]}>
        <boxGeometry args={[0.6, 0.15, 0.075]} />
        <meshStandardMaterial color="#1b91dd" emissive="#044a84" emissiveIntensity={0.65} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (lander ? 0.95 : 0.65), -0.75, 0]}>
          {lander ? (
            <>
              <mesh rotation={[0, 0, side * 0.42]}>
                <cylinderGeometry args={[0.055, 0.075, 2.3, 8]} />
                <meshStandardMaterial color="#e6cf81" metalness={0.4} />
              </mesh>
              <mesh position={[side * 0.50, -1.02, 0]}>
                <boxGeometry args={[0.75, 0.12, 0.66]} />
                <meshStandardMaterial color="#e9cf79" />
              </mesh>
            </>
          ) : (
            <>
              <mesh>
                <cylinderGeometry args={[0.22, 0.3, 2.7, 12]} />
                <meshStandardMaterial color="#ecf1f8" metalness={0.42} />
              </mesh>
              <mesh position={[0, 1.46, 0]}>
                <coneGeometry args={[0.22, 0.53, 12]} />
                <meshStandardMaterial color="#ef7338" />
              </mesh>
              <mesh position={[0, -0.9, 0]} rotation={[0, 0, -side * 0.14]}>
                <boxGeometry args={[0.12, 1.15, 0.8]} />
                <meshStandardMaterial color="#62aefb" metalness={0.25} />
              </mesh>
            </>
          )}
        </group>
      ))}
      <mesh position={[0, lander ? -0.95 : -1.63, 0]}>
        <cylinderGeometry args={[0.36, 0.25, 0.22, 14]} />
        <meshStandardMaterial color="#43556b" metalness={0.85} />
      </mesh>
      {flame && (
        <group position={[0, lander ? -1.5 : -2.13, 0]}>
          <mesh>
            <coneGeometry args={[lander ? 0.30 : 0.46, lander ? 1.2 : 1.9, 12]} />
            <meshBasicMaterial color="#49e7ff" transparent opacity={0.75} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <coneGeometry args={[0.20, 1.1, 12]} />
            <meshBasicMaterial color="#fff7ae" transparent opacity={0.92} />
          </mesh>
          <pointLight color="#58e4ff" intensity={3} distance={8} />
        </group>
      )}
    </group>
  );
}

function Astronaut() {
  return (
    <group>
      <mesh position={[0, 0.95, 0]}>
        <capsuleGeometry args={[0.36, 0.63, 5, 10]} />
        <meshStandardMaterial color="#e9f4ff" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.78, 0]}>
        <sphereGeometry args={[0.54, 18, 12]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.24} />
      </mesh>
      <mesh position={[0, 1.75, 0.42]}>
        <sphereGeometry args={[0.40, 18, 12, 0, Math.PI * 2, 0.28, 2.16]} />
        <meshStandardMaterial color="#123c6b" metalness={0.85} roughness={0.12} />
      </mesh>
      <mesh position={[0, 0.99, -0.38]}>
        <boxGeometry args={[0.70, 0.86, 0.35]} />
        <meshStandardMaterial color="#8cb8e5" />
      </mesh>
      <mesh position={[0, 1.05, 0.42]}>
        <boxGeometry args={[0.42, 0.23, 0.08]} />
        <meshStandardMaterial color="#8a4df6" emissive="#421aa4" emissiveIntensity={0.4} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.48, 0.96, 0]} rotation={[0, 0, side * 0.18]}>
            <capsuleGeometry args={[0.17, 0.56, 4, 8]} />
            <meshStandardMaterial color="#dcebf9" />
          </mesh>
          <mesh position={[side * 0.20, 0.05, 0]}>
            <capsuleGeometry args={[0.19, 0.72, 4, 8]} />
            <meshStandardMaterial color="#edf6ff" />
          </mesh>
          <mesh position={[side * 0.20, -0.48, 0.17]}>
            <boxGeometry args={[0.38, 0.24, 0.55]} />
            <meshStandardMaterial color="#a8b6c9" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LunarRover() {
  return (
    <group position={[9, -1.30, -13]}>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[3, 0.60, 2.1]} />
        <meshStandardMaterial color="#d5b575" metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.55, -0.30]}>
        <boxGeometry args={[1.5, 0.75, 1.2]} />
        <meshStandardMaterial color="#e8effa" metalness={0.3} />
      </mesh>
      {[-1, 1].map((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}-${sz}`} position={[sx * 1.35, 0.37, sz * 0.85]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.55, 0.55, 0.33, 14]} />
          <meshStandardMaterial color="#1f2535" roughness={0.85} />
        </mesh>
      )))}
      <mesh position={[-0.7, 2.25, -0.4]} rotation={[0.25, 0.1, 0]}>
        <boxGeometry args={[1.8, 0.10, 1.3]} />
        <meshStandardMaterial color="#1d66b5" emissive="#0c2960" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function SpaceStars() {
  const positions = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i < 140; i += 1) {
      const a = i * 2.39996323;
      const y = (i % 31) * 0.82 - 9;
      const r = 26 + (i % 7) * 3.1;
      points.push(Math.cos(a) * r, y, Math.sin(a) * r - 20);
    }
    return new Float32Array(points);
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#c7e8ff" size={0.11} sizeAttenuation />
    </points>
  );
}

function Terrain({ mars }: { mars: boolean }) {
  const rocks = useMemo(() =>
    Array.from({ length: 54 }, (_, i) => {
      const angle = i * 2.399963;
      const radius = 9 + (i % 12) * 3;
      return [Math.cos(angle) * radius, -1.75, Math.sin(angle) * radius - 12, 0.35 + (i % 4) * 0.18] as const;
    }), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, -24]} receiveShadow>
        <planeGeometry args={[230, 230, 1, 1]} />
        <meshStandardMaterial color={mars ? "#9b5237" : "#777e90"} roughness={0.99} />
      </mesh>
      {rocks.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1.8, 0.48, 1]}>
          <dodecahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={mars ? "#ad6551" : "#b6bbc6"} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, -2.10, -7]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.6, 0.09, 8, 48]} />
        <meshBasicMaterial color="#5cefdc" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function CelestialBody({ mars }: { mars: boolean }) {
  return (
    <group position={[0, -3.2, -12]}>
      <mesh>
        <sphereGeometry args={[5.2, 30, 24]} />
        <meshStandardMaterial color={mars ? "#b35a36" : "#2265ad"} roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <sphereGeometry args={[5.31, 30, 24]} />
        <meshBasicMaterial color={mars ? "#efaa65" : "#2b9fe7"} transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function SceneElements({ mission }: { mission: Mission }) {
  const craft = useRef<THREE.Group>(null);
  const pilot = useRef<THREE.Group>(null);
  const isEva = mission.stage === "eva" || mission.stage === "complete";
  const surface = isEva || mission.stage === "landing";
  const mars = mission.destination === "mars";

  useFrame(({ camera, clock }, dt) => {
    const smooth = Math.min(1, dt * 4);
    if (isEva) {
      const location = new THREE.Vector3(mission.evaX, -1.05 + (mission.evaY ?? 0) + Math.sin(clock.elapsedTime * 3.3) * 0.02, mission.evaZ);
      if (pilot.current) pilot.current.position.lerp(location, smooth * 1.6);
      camera.position.lerp(new THREE.Vector3(location.x + 3.1, 4.0, location.z + 10.0), smooth);
      camera.lookAt(location.x, 0.2, location.z - 5.2);
    } else {
      let y = 0.3;
      if (mission.stage === "launch") y = Math.min(1.5, mission.altitudeKm / 90);
      if (mission.stage === "landing") y = -0.25 + Math.min(2.2, mission.landingAltitude / 195);
      if (craft.current) {
        craft.current.position.lerp(new THREE.Vector3(mission.stage === "landing" ? mission.offset * 0.07 : Math.sin(mission.heading / 38) * 1.0, y, 0), smooth * 2);
        craft.current.rotation.z = THREE.MathUtils.lerp(craft.current.rotation.z, -mission.heading / 80, smooth * 2);
        craft.current.rotation.y = THREE.MathUtils.lerp(craft.current.rotation.y, mission.heading / 140, smooth * 2);
      }
      camera.position.lerp(new THREE.Vector3(2.6, surface ? 4.6 : 2.5, surface ? 12 : 10.6), smooth);
      camera.lookAt(0, surface ? 0.2 : 0.8, surface ? -4 : 0);
    }
  });

  return (
    <>
      <ambientLight intensity={1.25} />
      <directionalLight position={[9, 17, 9]} intensity={2.0} color={mars ? "#ffe1c3" : "#deebff"} />
      <pointLight position={[2, 3, 7]} color="#53d8ff" intensity={8} distance={28} />
      <SpaceStars />
      {surface ? <Terrain mars={mars} /> : <CelestialBody mars={mars} />}
      {!isEva && (
        <group ref={craft} scale={mission.stage === "landing" ? 0.9 : 1.0}>
          <Rocket lander={mission.stage === "landing"} flame={mission.stage !== "orbit" && (mission.stage !== "landing" || mission.throttle > 0.05)} />
        </group>
      )}
      {isEva && (
        <>
          <group ref={pilot}><Astronaut /></group>
          {SAMPLE_POINTS[mission.destination].map((sample, i) => (
            i >= mission.samples && (
              <group key={i} position={[sample.x, -1.27, sample.z]}>
                <mesh rotation={[0, Math.PI / 4, 0]}>
                  <octahedronGeometry args={[0.7, 0]} />
                  <meshStandardMaterial color="#6cf7ff" emissive="#19bde4" emissiveIntensity={1.4} metalness={0.3} />
                </mesh>
                <pointLight color="#60eaff" intensity={5} distance={8} />
              </group>
            )
          ))}
          <group position={[4.8, -0.7, 3.2]} scale={0.6}><Rocket lander flame={false} /></group>
          <LunarRover />
        </>
      )}
    </>
  );
}

export function GigaOrbitScene({ mission }: { mission: Mission }) {
  return (
    <Canvas
      aria-label="Interactive three-dimensional rocket and astronaut view"
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      dpr={[1, 1.5]}
      camera={{ position: [2.6, 2.5, 10.6], fov: 49, near: 0.1, far: 380 }}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
    >
      <Suspense fallback={null}>
        <SceneElements mission={mission} />
      </Suspense>
    </Canvas>
  );
}
