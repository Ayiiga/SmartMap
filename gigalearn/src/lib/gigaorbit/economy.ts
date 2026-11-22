import { type Destination, type Mission, type PilotProgress, newMission } from "./engine";

// All amounts are fictional in-game credits. No money, gambling, or cash prizes.
export type ShopItem = "fuelCell" | "repairKit" | "tank" | "armor" | "suit";
export const STORE: { id: ShopItem; name: string; description: string; price: number; icon: string; category: "consumable" | "upgrade" }[] = [
  { id: "fuelCell", name: "Emergency fuel cell", description: "Carry a +35-unit refuel pack into flight", price: 80, icon: "⛽", category: "consumable" },
  { id: "repairKit", name: "Hull repair kit", description: "Restore 35 hull integrity on the hangar or in flight", price: 65, icon: "🛠️", category: "consumable" },
  { id: "tank", name: "Extended fuel tank", description: "Increase launch fuel capacity by 20 units per level", price: 180, icon: "🚀", category: "upgrade" },
  { id: "armor", name: "Reinforced spacecraft", description: "Increase max hull integrity by 20 per level", price: 200, icon: "🛡️", category: "upgrade" },
  { id: "suit", name: "Explorer suit", description: "Increase astronaut walk/run speed by 12% per level", price: 150, icon: "👨‍🚀", category: "upgrade" },
];
export function itemPrice(id: ShopItem, progress: PilotProgress): number {
  const item = STORE.find((row) => row.id === id);
  if (!item) return Number.POSITIVE_INFINITY;
  return item.category === "upgrade" ? item.price + progress.upgrades[id as "tank" | "armor" | "suit"] * 70 : item.price;
}
export function buyItem(progress: PilotProgress, id: ShopItem): { progress: PilotProgress; ok: boolean; message: string } {
  const item = STORE.find((row) => row.id === id);
  if (!item) return { progress, ok: false, message: "Item not available." };
  if (item.category === "upgrade" && progress.upgrades[id as "tank" | "armor" | "suit"] >= 3)
    return { progress, ok: false, message: "Maximum upgrade level reached." };
  if (item.category === "consumable" && progress.inventory[id as "fuelCell" | "repairKit"] >= 99)
    return { progress, ok: false, message: "Your storage is full." };
  const price = itemPrice(id, progress);
  if (progress.credits < price) return { progress, ok: false, message: `Not enough coins. You need ${price - progress.credits} more.` };
  const next = { ...progress, credits: progress.credits - price };
  if (item.category === "consumable") {
    next.inventory = { ...progress.inventory, [id]: progress.inventory[id as "fuelCell" | "repairKit"] + 1 };
  } else {
    next.upgrades = { ...progress.upgrades, [id]: progress.upgrades[id as "tank" | "armor" | "suit"] + 1 };
    if (id === "armor") next.hull = Math.min(100 + next.upgrades.armor * 20, next.hull + 20);
  }
  return { progress: next, ok: true, message: `${item.name} purchased for ${price} coins.` };
}
export function preparedMission(destination: Destination, progress: PilotProgress): Mission {
  const mission = newMission(destination, progress.mode);
  const maxFuel = 100 + progress.upgrades.tank * 20;
  const maxHull = 100 + progress.upgrades.armor * 20;
  return {
    ...mission, fuel: maxFuel, maxFuel, maxHull,
    hull: Math.max(30, Math.min(maxHull, progress.hull)),
    suitLevel: progress.upgrades.suit,
  };
}
export function applyConsumable(progress: PilotProgress, mission: Mission | null, id: "fuelCell" | "repairKit"): {
  progress: PilotProgress; mission: Mission | null; ok: boolean; message: string
} {
  if (progress.inventory[id] <= 0) return { progress, mission, ok: false, message: "Buy a kit at the workshop first." };
  if (id === "fuelCell") {
    if (!mission || !["launch", "orbit", "transfer", "landing"].includes(mission.stage))
      return { progress, mission, ok: false, message: "Fuel packs are used during an active flight." };
    if (mission.fuel >= mission.maxFuel - 0.01)
      return { progress, mission, ok: false, message: "Your fuel tank is already full." };
    return {
      progress: { ...progress, inventory: { ...progress.inventory, fuelCell: progress.inventory.fuelCell - 1 } },
      mission: { ...mission, fuel: Math.min(mission.maxFuel, mission.fuel + 35) },
      ok: true, message: "Emergency fuel used: +35 fuel units.",
    };
  }
  const cap = mission ? mission.maxHull : 100 + progress.upgrades.armor * 20;
  const hull = mission ? mission.hull : progress.hull;
  if (hull >= cap - 0.01) return { progress, mission, ok: false, message: "Hull is already fully repaired." };
  const restored = Math.min(cap, hull + 35);
  return {
    progress: { ...progress,
      hull: mission ? progress.hull : restored,
      inventory: { ...progress.inventory, repairKit: progress.inventory.repairKit - 1 } },
    mission: mission ? { ...mission, hull: restored } : null,
    ok: true, message: "Repair complete: +35 hull integrity.",
  };
}
export const AWARDS = [
  { id: "first_orbit", title: "Orbital Navigator", prize: 60, description: "Reach Earth orbit" },
  { id: "moon_landed", title: "Lunar Touchdown", prize: 100, description: "Successfully land on the Moon" },
  { id: "mars_landed", title: "Mars Touchdown", prize: 150, description: "Successfully land on Mars" },
] as const;
export type AwardId = typeof AWARDS[number]["id"];
export function claimAward(progress: PilotProgress, id: AwardId): PilotProgress {
  const medal = AWARDS.find((a) => a.id === id);
  if (!medal || progress.milestones.includes(id)) return progress;
  return {
    ...progress,
    credits: progress.credits + medal.prize,
    xp: progress.xp + 25,
    milestones: [...progress.milestones, id],
    badges: [...progress.badges, medal.title],
  };
}
export function recordCrash(progress: PilotProgress): PilotProgress {
  return { ...progress, hull: Math.max(30, progress.hull - 25), flights: progress.flights + 1 };
}
export function recordSuccess(progress: PilotProgress, mission: Mission): PilotProgress {
  return { ...progress,
    hull: Math.max(30, Math.min(mission.maxHull, mission.hull)),
    flights: progress.flights + 1,
  };
}
