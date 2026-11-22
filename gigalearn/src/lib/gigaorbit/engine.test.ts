import { describe, expect, it } from "vitest";
import {
  action, advance, award, canChoose, interact, newMission, newProgress,
  restoreMission, restoreProgress, SAMPLE_POINTS, sampleDistance, type ControlInput, type Mission,
} from "./engine";

const idle: ControlInput = { x: 0, y: 0, boost: false, brake: false, throttleDelta: 0 };
const tick = (m: Mission, frames: number) => {
  for (let i = 0; i < frames; i += 1) m = advance(m, idle, 0.05);
  return m;
};
describe("GigaOrbit playable Earth-to-Moon mission", () => {
  it("begins with a fully offline, controllable launch", () => {
    const m = tick(newMission("moon"), 40);
    expect(m.altitudeKm).toBeGreaterThan(0);
    expect(m.speed).toBeGreaterThan(0);
    expect(m.fuel).toBeLessThan(100);
  });
  it("requires staging, reaches orbit and can transfer", () => {
    let m = newMission();
    for (let i = 0; i < 1000 && m.stage === "launch"; i += 1) {
      if (!m.staged && m.altitudeKm >= 25) m = action(m, "stage");
      m = advance(m, idle, 0.05);
    }
    expect(m.stage).toBe("orbit");
    m = action(m, "transfer");
    expect(m.stage).toBe("transfer");
    m = tick(m, 800);
    expect(m.stage).toBe("landing");
  });
  it("provides an accessible piloted landing and a recoverable crash", () => {
    let m: Mission = { ...newMission(), stage: "landing", landingAltitude: 100, descent: 3, throttle: 0.25, offset: 3 };
    m = action(m, "gear");
    m = tick(m, 2000);
    expect(m.stage).toBe("eva");
    const crash = tick({ ...newMission(), stage: "landing", landingAltitude: 10, descent: 10, gear: false }, 100);
    expect(crash.stage).toBe("failed");
    expect(action(crash, "retry").stage).toBe("launch");
  });
  it("requires real astronaut movement, sample collection and return", () => {
    let m: Mission = { ...newMission(), stage: "eva" };
    expect(interact(m).samples).toBe(0);
    for (const target of SAMPLE_POINTS.moon) {
      m = { ...m, evaX: target.x, evaZ: target.z };
      expect(sampleDistance(m)).toBeLessThan(0.1);
      m = interact(m);
    }
    expect(m.samples).toBe(2);
    expect(m.stage).toBe("eva");
    m = { ...m, evaX: 0, evaZ: 0 };
    expect(interact(m).stage).toBe("complete");
  });
  it("unlocks Mars, rewards only once, and protects against corrupted saves", () => {
    const progress = newProgress();
    expect(canChoose("mars", progress)).toBe(false);
    const completed = { ...newMission("moon"), stage: "complete" as const };
    const awarded = award(progress, completed);
    expect(canChoose("mars", awarded)).toBe(true);
    expect(award(awarded, completed).credits).toBe(awarded.credits);
    expect(restoreProgress(JSON.stringify(awarded)).completed).toContain("moon");
    expect(restoreProgress("corrupt")).toEqual(progress);
    expect(restoreMission("bad json")).toBeNull();
    expect(restoreMission(JSON.stringify(newMission()))?.stage).toBe("launch");
  });
  it("supports Mars as a distinct sample mission without unlocking fake destinations", () => {
    const mars = newMission("mars", "pilot");
    expect(mars.landingAltitude).toBeGreaterThan(newMission("moon").landingAltitude);
    expect(SAMPLE_POINTS.mars).toHaveLength(3);
  });
});
