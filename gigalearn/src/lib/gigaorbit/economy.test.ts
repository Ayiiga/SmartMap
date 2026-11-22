import { describe, expect, it } from "vitest";
import { award, newMission, newProgress, restoreMission, restoreProgress } from "./engine";
import { AWARDS, buyItem, claimAward, itemPrice, preparedMission, recordCrash, recordSuccess, applyConsumable } from "./economy";

describe("GigaOrbit coin economy and achievement integrity", () => {
  it("grants 250 fictional starter coins only once, including existing pilot migrations", () => {
    const fresh = newProgress();
    expect(fresh.credits).toBe(250);
    expect(restoreProgress(JSON.stringify(fresh)).credits).toBe(250);
    const legacy = { version: 1, xp: 30, credits: 0, completed: ["moon"], mode: "pilot", bestMoon: 3, bestMars: 0 };
    const upgraded = restoreProgress(JSON.stringify(legacy));
    expect(upgraded.credits).toBe(250);
    expect(upgraded.completed).toContain("moon");
    expect(upgraded.mode).toBe("pilot");
    expect(restoreProgress(JSON.stringify(upgraded)).credits).toBe(250);
  });
  it("buys emergency fuel and uses exactly one inventory pack while flying", () => {
    const before = newProgress();
    const paid = buyItem(before, "fuelCell");
    expect(paid.ok).toBe(true);
    expect(paid.progress.credits).toBe(170);
    expect(paid.progress.inventory.fuelCell).toBe(1);
    const mission = { ...preparedMission("moon", paid.progress), fuel: 35 };
    const used = applyConsumable(paid.progress, mission, "fuelCell");
    expect(used.ok).toBe(true);
    expect(used.mission?.fuel).toBe(70);
    expect(used.progress.inventory.fuelCell).toBe(0);
    const retry = applyConsumable(used.progress, used.mission, "fuelCell");
    expect(retry.ok).toBe(false);
    expect(retry.progress.credits).toBe(170);
    expect(applyConsumable(paid.progress, preparedMission("moon", paid.progress), "fuelCell").ok).toBe(false);
  });
  it("buys and applies repairs with no free item duplication or hull overfill", () => {
    const broken = { ...newProgress(), hull: 40 };
    const buy = buyItem(broken, "repairKit");
    expect(buy.ok).toBe(true);
    const repaired = applyConsumable(buy.progress, null, "repairKit");
    expect(repaired.ok).toBe(true);
    expect(repaired.progress.hull).toBe(75);
    expect(repaired.progress.inventory.repairKit).toBe(0);
    expect(applyConsumable(repaired.progress, null, "repairKit").ok).toBe(false);
    expect(recordCrash(repaired.progress).hull).toBe(50);
    expect(recordCrash({ ...newProgress(), hull: 30 }).hull).toBe(30);
  });
  it("spends coins on real tank, armor and suit upgrades and enforces affordability", () => {
    const start = newProgress();
    const tank = buyItem(start, "tank");
    expect(tank.ok).toBe(true);
    expect(tank.progress.upgrades.tank).toBe(1);
    expect(tank.progress.credits).toBe(70);
    expect(preparedMission("moon", tank.progress).fuel).toBe(120);
    expect(itemPrice("tank", tank.progress)).toBe(250);
    const poor = buyItem(tank.progress, "armor");
    expect(poor.ok).toBe(false);
    expect(poor.progress).toEqual(tank.progress);
    const wealthy = { ...start, credits: 1500 };
    const armor = buyItem(wealthy, "armor");
    expect(armor.progress.hull).toBe(120);
    expect(preparedMission("moon", armor.progress).maxHull).toBe(120);
    const suit = buyItem(wealthy, "suit");
    expect(preparedMission("moon", suit.progress).suitLevel).toBe(1);
  });
  it("awards milestone prizes only once; coins are not redeemable as money", () => {
    let p = newProgress();
    for (const badge of AWARDS) {
      const once = claimAward(p, badge.id);
      expect(once.credits).toBe(p.credits + badge.prize);
      p = once;
      expect(claimAward(p, badge.id)).toEqual(p);
    }
    const completion = { ...newMission("moon"), stage: "complete" as const };
    const first = award(p, completion);
    expect(first.credits).toBe(p.credits + 500);
    expect(first.badges).toContain("Lunar Pioneer");
    expect(award(first, completion)).toEqual(first);
    const replay = recordSuccess(first, { ...completion, hull: 95 });
    expect(replay.hull).toBe(95);
  });
  it("restores an old interrupted rocket checkpoint with new economic fields", () => {
    const legacy = { ...newMission("moon"), maxFuel: undefined, hull: undefined, maxHull: undefined, suitLevel: undefined };
    const restored = restoreMission(JSON.stringify(legacy));
    expect(restored?.maxFuel).toBe(100);
    expect(restored?.hull).toBe(100);
    expect(restored?.maxHull).toBe(100);
    expect(restored?.suitLevel).toBe(0);
  });
});
