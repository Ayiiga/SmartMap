/** GigaOrbit web mission rules — deterministic, network-free, and independently testable.
 * Flight distances are time-compressed arcade simulation values, not orbital mechanics.
 */
export type Destination = "moon" | "mars";
export type HandlingMode = "explorer" | "pilot";
export type Stage = "launch" | "orbit" | "transfer" | "landing" | "eva" | "complete" | "failed";
export type ControlInput = { x: number; y: number; boost: boolean; brake: boolean; throttleDelta: number; jump?: boolean };
export type Sample = { x: number; z: number };
export type Mission = {
  destination: Destination;
  stage: Stage;
  mode: HandlingMode;
  seconds: number;
  altitudeKm: number;
  speed: number;
  fuel: number;
  maxFuel: number;
  hull: number;
  maxHull: number;
  suitLevel: number;
  throttle: number;
  heading: number;
  pitch: number;
  staged: boolean;
  transfer: number;
  landingAltitude: number;
  descent: number;
  offset: number;
  gear: boolean;
  evaX: number;
  evaZ: number;
  evaY: number;
  evaVelocity: number;
  samples: number;
  awarded: boolean;
  message: string;
};
export type PilotProgress = {
  version: 1;
  xp: number;
  credits: number;
  completed: Destination[];
  bestMoon: number;
  bestMars: number;
  mode: HandlingMode;
  hull: number;
  upgrades: { tank: number; armor: number; suit: number };
  inventory: { fuelCell: number; repairKit: number };
  badges: string[];
  milestones: string[];
  flights: number;
};
export const SAMPLE_POINTS: Record<Destination, Sample[]> = {
  moon: [{ x: -4, z: -9 }, { x: 6, z: -18 }],
  mars: [{ x: -6, z: -11 }, { x: 8, z: -19 }, { x: -3, z: -26 }],
};
export const MAX_X = 45;
export const MAX_Z = 45;
export const destinations: { name: string; status: string; playable: boolean; body: string }[] = [
  { name: "Earth", status: "Launchpad", playable: true, body: "earth" },
  { name: "Moon", status: "First expedition", playable: true, body: "moon" },
  { name: "Mars", status: "Unlock after the Moon", playable: true, body: "mars" },
  { name: "Venus", status: "Robotic atmosphere mission planned", playable: false, body: "venus" },
  { name: "Mercury", status: "Heat probe mission planned", playable: false, body: "mercury" },
  { name: "Jupiter moons", status: "Orbital survey planned", playable: false, body: "jupiter" },
  { name: "Saturn moons", status: "Titan / Enceladus planned", playable: false, body: "saturn" },
  { name: "Uranus", status: "Deep-space survey planned", playable: false, body: "uranus" },
  { name: "Neptune", status: "Deep-space survey planned", playable: false, body: "neptune" },
];
export function newProgress(): PilotProgress {
  // A one-time virtual starter budget supports repairs before any mission completion.
  return {
    version: 1, xp: 0, credits: 250, completed: [], bestMoon: 0, bestMars: 0, mode: "explorer",
    hull: 100, upgrades: { tank: 0, armor: 0, suit: 0 },
    inventory: { fuelCell: 0, repairKit: 0 }, badges: [], milestones: [], flights: 0,
  };
}
export function newMission(destination: Destination = "moon", mode: HandlingMode = "explorer"): Mission {
  return {
    destination, stage: "launch", mode, seconds: 0, altitudeKm: 0, speed: 0,
    fuel: 100, maxFuel: 100, hull: 100, maxHull: 100, suitLevel: 0,
    throttle: 0.80, heading: 0, pitch: 0, staged: false, transfer: 0,
    landingAltitude: destination === "moon" ? 500 : 620, descent: 8,
    offset: 5, gear: false, evaX: 0, evaZ: 0, evaY: 0, evaVelocity: 0, samples: 0, awarded: false,
    message: "Ignite the engines! Keep your rocket climbing.",
  };
}
export function canChoose(destination: Destination, progress: PilotProgress): boolean {
  return destination === "moon" || progress.completed.includes("moon");
}
export function sampleTarget(mission: Mission): Sample | null {
  return SAMPLE_POINTS[mission.destination][mission.samples] ?? null;
}
export function sampleDistance(mission: Mission): number {
  const target = sampleTarget(mission) ?? { x: 0, z: 0 };
  return Math.hypot(target.x - mission.evaX, target.z - mission.evaZ);
}
export function canInteract(mission: Mission): boolean {
  if (mission.stage !== "eva") return false;
  return sampleDistance(mission) < 2.8;
}
export function interact(mission: Mission): Mission {
  if (mission.stage !== "eva") return mission;
  if (!canInteract(mission)) return { ...mission, message: mission.samples >= SAMPLE_POINTS[mission.destination].length ? "Return to your spacecraft to deliver samples." : "Approach the glowing sample marker." };
  if (mission.samples < SAMPLE_POINTS[mission.destination].length) {
    return { ...mission, samples: mission.samples + 1, message: "Sample secured! Continue the expedition." };
  }
  return { ...mission, stage: "complete", message: "Mission complete! Research samples returned safely." };
}
export function action(mission: Mission, name: "stage" | "transfer" | "gear" | "retry" | "eva"): Mission {
  if (name === "retry") return newMission(mission.destination, mission.mode);
  if (name === "stage" && mission.stage === "launch" && mission.altitudeKm >= 25 && !mission.staged) {
    return { ...mission, staged: true, fuel: Math.min(mission.maxFuel, mission.fuel + 15), message: "Stage separated! Upper engine online." };
  }
  if (name === "transfer" && mission.stage === "orbit") {
    return { ...mission, stage: "transfer", transfer: 0, message: "Transfer burn: steer and keep the engine firing." };
  }
  if (name === "gear" && mission.stage === "landing" && !mission.gear) {
    return { ...mission, gear: true, message: "Landing gear deployed. Keep your touchdown gentle." };
  }
  if (name === "eva" && mission.stage === "landing" && mission.landingAltitude <= 0) {
    return { ...mission, stage: "eva", evaX: 0, evaZ: 0, evaY: 0, evaVelocity: 0, samples: 0, message: "Exit the lander and collect your first sample." };
  }
  return mission;
}
export function advance(mission: Mission, input: ControlInput, rawDelta: number): Mission {
  const dt = Math.max(0, Math.min(rawDelta, 0.065));
  if (!dt || mission.stage === "complete" || mission.stage === "failed" || mission.stage === "orbit") return mission;
  const f: Mission = { ...mission, seconds: mission.seconds + dt };
  if (f.stage === "eva") {
    const magnitude = Math.max(1, Math.hypot(input.x, input.y));
    const movement = (f.mode === "pilot" ? 5.8 : 7.8) * (input.boost ? 1.42 : 1) * (1 + f.suitLevel * 0.12);
    if (input.jump && f.evaY <= 0.001) f.evaVelocity = f.destination === "moon" ? 4.6 : 4.1;
    f.evaVelocity -= (f.destination === "moon" ? 1.62 : 3.71) * dt * 2.1;
    f.evaY = Math.max(0, f.evaY + f.evaVelocity * dt);
    if (f.evaY === 0 && f.evaVelocity < 0) f.evaVelocity = 0;
    f.evaX = Math.max(-MAX_X, Math.min(MAX_X, f.evaX + input.x / magnitude * movement * dt));
    f.evaZ = Math.max(-MAX_Z, Math.min(MAX_Z, f.evaZ + input.y / magnitude * movement * dt));
    return f;
  }
  f.throttle = Math.max(0, Math.min(1, f.throttle + input.throttleDelta * dt * 0.72));
  f.heading = Math.max(-45, Math.min(45, f.heading + input.x * dt * (f.mode === "pilot" ? 40 : 26)));
  f.pitch = Math.max(-35, Math.min(35, (f.pitch ?? 0) - input.y * dt * (f.mode === "pilot" ? 38 : 26)));
  if (f.mode === "explorer" && Math.abs(input.y) < 0.08) f.pitch *= Math.max(0, 1 - dt * 0.7);
  if (f.mode === "explorer" && Math.abs(input.x) < 0.08) f.heading *= Math.max(0, 1 - dt * 0.55);
  if (f.stage === "launch") {
    const pitchEfficiency = Math.max(0.7, 1 - Math.abs(f.pitch) / 110);
    const acceleration = (f.staged ? 24 : 19) * f.throttle * pitchEfficiency - 5.5 + (input.boost ? 12 : 0);
    f.speed = Math.max(0, Math.min(900, f.speed + acceleration * dt));
    f.altitudeKm += f.speed * dt * 0.07;
    f.fuel = Math.max(0, f.fuel - dt * (0.85 * f.throttle + (input.boost ? 1.8 : 0)));
    if (f.fuel <= 0 && f.altitudeKm < 120) return { ...f, stage: "failed", message: "Rocket ran out of fuel before orbit. Restart for free." };
    if (f.altitudeKm >= 120 && f.staged) {
      return { ...f, stage: "orbit", speed: 7600, altitudeKm: 120, message: "Earth orbit achieved! Begin the planetary transfer." };
    }
    if (f.altitudeKm >= 45 && !f.staged) f.message = "Ready for STAGE SEPARATION — tap STAGE!";
    return f;
  }
  if (f.stage === "transfer") {
    const alignment = Math.max(0.35, 1 - (Math.abs(f.heading) + Math.abs(f.pitch)) / 125);
    f.transfer = Math.min(100, f.transfer + dt * (2.6 + f.throttle * 3.5) * alignment);
    f.fuel = Math.max(0, f.fuel - dt * (0.40 * f.throttle + (input.boost ? 1.1 : 0)));
    if (input.boost && f.fuel > 0) f.transfer = Math.min(100, f.transfer + dt * 4.5);
    if (f.transfer >= 100) {
      return { ...f, stage: "landing", landingAltitude: f.destination === "moon" ? 500 : 620,
        descent: 8, offset: 5, gear: false, throttle: 0.26, message: "Approaching surface! Reduce descent speed and deploy gear." };
    }
    if (f.fuel <= 0) return { ...f, stage: "failed", message: "Transfer fuel exhausted. Try a more efficient burn." };
    return f;
  }
  if (f.stage === "landing") {
    const gravity = f.destination === "moon" ? 1.62 : 3.71;
    const maxBraking = f.mode === "explorer" ? 6.5 : 6.0;
    // Explorer stabilization makes a soft touchdown achievable without forcing autoplay.
    const stabilizer = f.mode === "explorer" && f.landingAltitude < 130 && f.descent > 4 ? 1.5 : 0;
    f.descent = Math.max(1.2, Math.min(23, f.descent + (gravity * 0.54 - f.throttle * maxBraking - (input.brake ? 3.6 : 0) - stabilizer) * dt));
    f.landingAltitude = Math.max(0, f.landingAltitude - f.descent * dt * 8.0);
    f.offset = Math.max(-28, Math.min(28, f.offset + input.x * 8.0 * dt));
    f.fuel = Math.max(0, f.fuel - dt * (f.throttle * 0.75 + (input.brake ? 0.7 : 0)));
    if (f.landingAltitude <= 0) {
      if (f.gear && f.descent <= 7 && Math.abs(f.offset) <= 13) {
        return { ...f, landingAltitude: 0, descent: 0, stage: "eva", evaX: 0, evaZ: 0, evaY: 0, evaVelocity: 0, samples: 0, message: "Touchdown confirmed! Explore the surface and collect samples." };
      }
      return { ...f, stage: "failed", message: !f.gear ? "Landing gear was not deployed. Try again!" : f.descent > 7 ? "Touchdown too fast. Use BRAKE and thrust earlier." : "Missed the landing zone. Steer closer to center." };
    }
    return f;
  }
  return f;
}
export function award(progress: PilotProgress, mission: Mission): PilotProgress {
  if (mission.stage !== "complete") return progress;
  if (progress.completed.includes(mission.destination)) return progress;
  const next = {
    ...progress,
    completed: [...progress.completed, mission.destination],
    credits: progress.credits + (mission.destination === "moon" ? 500 : 800),
    xp: progress.xp + (mission.destination === "moon" ? 200 : 350),
    badges: [...progress.badges, mission.destination === "moon" ? "Lunar Pioneer" : "Mars Pathfinder"],
  };
  if (mission.destination === "moon") next.bestMoon = Math.max(progress.bestMoon, 3);
  else next.bestMars = Math.max(progress.bestMars, 3);
  return next;
}
export function restoreProgress(raw: string | null): PilotProgress {
  const defaults = newProgress();
  if (!raw) return defaults;
  try {
    const p = JSON.parse(raw) as Partial<PilotProgress>;
    if (p.version !== 1) return defaults;
    return {
      ...defaults,
      xp: Math.max(0, Number(p.xp) || 0),
      // Old saved pilots (before the shop) receive the starter grant exactly once.
      credits: Math.max(0, Number(p.credits) || 0) + (p.inventory === undefined ? 250 : 0),
      completed: Array.isArray(p.completed) ? p.completed.filter((n): n is Destination => n === "moon" || n === "mars") : [],
      mode: p.mode === "pilot" ? "pilot" : "explorer",
      bestMoon: Math.max(0, Number(p.bestMoon) || 0), bestMars: Math.max(0, Number(p.bestMars) || 0),
      hull: Math.max(30, Math.min(160, Number(p.hull) || 100)),
      upgrades: {
        tank: Math.max(0, Math.min(3, Number(p.upgrades?.tank) || 0)),
        armor: Math.max(0, Math.min(3, Number(p.upgrades?.armor) || 0)),
        suit: Math.max(0, Math.min(3, Number(p.upgrades?.suit) || 0)),
      },
      inventory: {
        fuelCell: Math.max(0, Math.min(99, Number(p.inventory?.fuelCell) || 0)),
        repairKit: Math.max(0, Math.min(99, Number(p.inventory?.repairKit) || 0)),
      },
      badges: Array.isArray(p.badges) ? p.badges.filter((b): b is string => typeof b === "string").slice(0, 30) : [],
      milestones: Array.isArray(p.milestones) ? p.milestones.filter((b): b is string => typeof b === "string").slice(0, 30) : [],
      flights: Math.max(0, Number(p.flights) || 0),
    };
  } catch { return defaults; }
}
export function restoreMission(raw: string | null): Mission | null {
  if (!raw) return null;
  try {
    const f = JSON.parse(raw) as Mission;
    if (f && (f.destination === "moon" || f.destination === "mars")
      && ["launch", "orbit", "transfer", "landing", "eva"].includes(f.stage)
      && Number.isFinite(f.altitudeKm) && Number.isFinite(f.fuel) && Number.isFinite(f.evaZ)
      && Number.isFinite(f.evaX) && Number.isFinite(f.throttle) && Number.isFinite(f.landingAltitude)) return f;
  } catch { /* recover from interrupted/corrupt storage */ }
  return null;
}
