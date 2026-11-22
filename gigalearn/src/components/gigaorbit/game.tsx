"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  advance, action, award, canChoose, canInteract, destinations, interact,
  newMission, newProgress, restoreMission, restoreProgress, SAMPLE_POINTS, sampleDistance,
  type ControlInput, type Destination, type HandlingMode, type Mission, type PilotProgress,
} from "@/lib/gigaorbit/engine";
import {
  AWARDS, STORE, buyItem, claimAward, itemPrice, preparedMission,
  recordCrash, recordSuccess, useItem, type ShopItem,
} from "@/lib/gigaorbit/economy";

const Scene = dynamic(() => import("./scene").then((mod) => mod.GigaOrbitScene), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm font-semibold text-cyan-200">Preparing 3D spacecraft…</div>,
});
type View = "menu" | "game" | "map" | "help" | "settings" | "workshop" | "awards";
type MoveAxis = { x: number; y: number };
const PROGRESS_KEY = "gigaorbit_web_pilot_v1";
const MISSION_KEY = "gigaorbit_web_mission_v1";
const NO_INPUT: ControlInput = { x: 0, y: 0, boost: false, brake: false, throttleDelta: 0, jump: false };

function Joystick({ onChange }: { onChange: (value: MoveAxis) => void }) {
  const pointerId = useRef<number | null>(null);
  const [stick, setStick] = useState<MoveAxis>({ x: 0, y: 0 });
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId) return;
    const r = event.currentTarget.getBoundingClientRect();
    const radius = Math.max(1, Math.min(r.width, r.height) * 0.35);
    let x = (event.clientX - (r.left + r.width / 2)) / radius;
    let y = (event.clientY - (r.top + r.height / 2)) / radius;
    const length = Math.max(1, Math.hypot(x, y));
    x /= length; y /= length;
    if (Math.hypot(x, y) < 0.12) { x = 0; y = 0; }
    setStick({ x, y }); onChange({ x, y });
  };
  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId) return;
    pointerId.current = null; setStick({ x: 0, y: 0 }); onChange({ x: 0, y: 0 });
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* already released */ }
  };
  return (
    <div
      role="group"
      aria-label="Flight and astronaut joystick. Drag to move; keyboard arrow keys also work."
      className="relative size-[112px] select-none rounded-full border-[3px] border-cyan-200/65 bg-slate-950/70 shadow-[0_0_26px_rgba(67,218,252,.24)] sm:size-[142px]"
      style={{ touchAction: "none" }}
      onPointerDown={(event) => { event.preventDefault(); pointerId.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); move(event); }}
      onPointerMove={move} onPointerUp={release} onPointerCancel={release}
    >
      <div className="absolute inset-[16%] rounded-full border border-cyan-300/25" />
      <div className="absolute left-1/2 top-1/2 size-[46px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-gradient-to-br from-slate-200 to-cyan-500 shadow-xl sm:size-[60px]" style={{ transform: `translate(calc(-50% + ${stick.x * 32}px), calc(-50% + ${stick.y * 32}px))` }} />
      <span className="pointer-events-none absolute -bottom-6 inset-x-0 text-center text-[10px] font-semibold uppercase tracking-widest text-cyan-100">Move / steer</span>
    </div>
  );
}

function HoldButton({ label, onStart, onEnd, disabled = false, color = "cyan" }: {
  label: string; onStart: () => void; onEnd: () => void; disabled?: boolean; color?: "cyan" | "orange" | "gray";
}) {
  const colorClass = color === "orange" ? "border-orange-300/70 bg-orange-400/25 text-orange-50" : color === "gray" ? "border-white/30 bg-slate-900/80 text-white" : "border-cyan-200/70 bg-cyan-300/25 text-cyan-50";
  return (
    <button type="button" disabled={disabled}
      className={`min-h-11 min-w-[70px] select-none rounded-xl border px-3 py-2 text-xs font-black shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm ${colorClass}`}
      style={{ touchAction: "none" }}
      onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); onStart(); }}
      onPointerUp={onEnd} onPointerCancel={onEnd} onPointerLeave={onEnd}
      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") onStart(); }}
      onKeyUp={onEnd}
    >{label}</button>
  );
}

function PrimaryButton({ children, onClick, disabled = false, outline = false }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; outline?: boolean;
}) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`min-h-[48px] rounded-xl px-5 py-3 text-sm font-extrabold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 ${outline ? "border border-white/30 bg-slate-950/70 text-white hover:bg-white/10" : "bg-gradient-to-r from-cyan-300 to-blue-500 text-[#06162c] shadow-[0_10px_38px_rgba(45,212,255,.22)] hover:brightness-110"}`}>{children}</button>;
}

function backgroundFor(mission: Mission | null): string {
  if (!mission) return "/gigaorbit/launch-cockpit.webp";
  if (mission.destination === "mars" && ["landing", "eva"].includes(mission.stage)) return "/gigaorbit/mission-overview.webp";
  if (mission.stage === "launch") return "/gigaorbit/launch-rocket.webp";
  if (mission.stage === "orbit" || mission.stage === "transfer") return "/gigaorbit/earth-orbit.webp";
  return "/gigaorbit/lunar-rover.webp";
}
function stageName(stage: Mission["stage"]): string {
  return ({ launch: "ROCKET LAUNCH", orbit: "EARTH ORBIT", transfer: "INTERPLANETARY TRANSFER", landing: "PLANETARY LANDING", eva: "SURFACE EXPEDITION", complete: "MISSION COMPLETED", failed: "MISSION RECOVERY" })[stage];
}
function objective(mission: Mission): string {
  if (mission.stage === "launch") return !mission.staged ? "Reach 25 km and separate the booster." : "Reach 120 km and establish orbit.";
  if (mission.stage === "orbit") return "Orbit achieved! Begin the next transfer.";
  if (mission.stage === "transfer") return `Pilot toward ${mission.destination === "moon" ? "the Moon" : "Mars"} and complete the transfer burn.`;
  if (mission.stage === "landing") return "Deploy landing gear · brake below 7 m/s · land in the zone.";
  if (mission.stage === "eva") return mission.samples === SAMPLE_POINTS[mission.destination].length ? "Return to the spacecraft and deliver the samples." : "Walk toward the blue sample and collect it.";
  return mission.message;
}

export default function GigaOrbitGame() {
  const [view, setView] = useState<View>("menu");
  const [mission, setMission] = useState<Mission | null>(null);
  const [progress, setProgress] = useState<PilotProgress>(newProgress);
  const [savedMission, setSavedMission] = useState<Mission | null>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination>("moon");
  const [mute, setMute] = useState(false);
  const playCue = useCallback((frequency: number) => {
    if (mute) return;
    try {
      const ctx = new window.AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.25, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.23);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(); oscillator.stop(ctx.currentTime + 0.24);
      oscillator.onended = () => { void ctx.close(); };
    } catch { /* Browser without Web Audio continues silently */ }
  }, [mute]);
  const motionRef = useRef<ControlInput>({ ...NO_INPUT });
  const missionRef = useRef<Mission | null>(null);
  const progressRef = useRef<PilotProgress>(newProgress());
  const pausedRef = useRef(false);
  const lastFrame = useRef(0);
  const lastPaint = useRef(0);
  const viewRef = useRef<View>("menu");

  const syncMission = useCallback((next: Mission | null) => {
    missionRef.current = next; setMission(next);
  }, []);
  const syncView = useCallback((next: View) => { viewRef.current = next; setView(next); }, []);
  const syncProgress = useCallback((next: PilotProgress) => {
    progressRef.current = next; setProgress(next);
    try { window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); }
    catch { /* Local storage is optional */ }
  }, []);
  const syncPaused = useCallback((next: boolean) => { pausedRef.current = next; setPaused(next); }, []);

  useEffect(() => {
    try {
      const p = restoreProgress(window.localStorage.getItem(PROGRESS_KEY));
      const m = restoreMission(window.localStorage.getItem(MISSION_KEY));
      syncProgress(p);
      setSelectedDestination(m?.destination ?? "moon");
      setSavedMission(m);
    } catch { /* Restricted storage still permits guest play */ }
    setReady(true);
  }, [syncProgress]);

  useEffect(() => {
    if (!ready) return;
    const persist = () => {
      try {
        window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressRef.current));
        const m = missionRef.current;
        if (m && !["complete", "failed"].includes(m.stage)) {
          window.localStorage.setItem(MISSION_KEY, JSON.stringify(m));
        } else if (!m || ["complete", "failed"].includes(m.stage)) {
          window.localStorage.removeItem(MISSION_KEY);
        }
      } catch { /* Play remains available if storage is unavailable */ }
    };
    const timer = window.setInterval(persist, 1800);
    window.addEventListener("pagehide", persist);
    return () => { window.clearInterval(timer); window.removeEventListener("pagehide", persist); persist(); };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const tick = (now: number) => {
      const dt = lastFrame.current ? Math.min(0.065, (now - lastFrame.current) / 1000) : 0;
      lastFrame.current = now;
      const old = missionRef.current;
      if (dt > 0 && viewRef.current === "game" && !pausedRef.current && old && !["complete", "failed"].includes(old.stage)) {
        const next = advance(old, motionRef.current, dt);
        if (old.stage !== next.stage) {
          motionRef.current = { ...NO_INPUT };
          if (next.stage === "orbit") syncProgress(claimAward(progressRef.current, "first_orbit"));
          if (next.stage === "eva") {
            syncProgress(claimAward(progressRef.current, next.destination === "moon" ? "moon_landed" : "mars_landed"));
          }
          if (next.stage === "failed") {
            const damagedHull = recordCrash(progressRef.current);
            next.hull = damagedHull.hull;
            syncProgress(damagedHull);
          }
          if (next.stage === "complete") {
            next.awarded = !progressRef.current.completed.includes(next.destination);
            syncProgress(recordSuccess(award(progressRef.current, next), next));
          }
          setMessage(next.message);
        }
        missionRef.current = next;
        if (now - lastPaint.current > 85 || old.stage !== next.stage) {
          setMission({ ...next }); lastPaint.current = now;
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => { window.cancelAnimationFrame(raf); lastFrame.current = 0; };
  }, [ready, syncProgress]);

  useEffect(() => {
    if (view !== "game" || paused) return;
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) e.preventDefault();
      if (key === "arrowleft" || key === "a") motionRef.current.x = -1;
      if (key === "arrowright" || key === "d") motionRef.current.x = 1;
      if (key === "arrowup" || key === "w") motionRef.current.y = -1;
      if (key === "arrowdown" || key === "s") motionRef.current.y = 1;
      if (key === " " && missionRef.current?.stage === "eva") motionRef.current.jump = true;
      else if (key === " " || key === "b") motionRef.current.brake = true;
      if (key === "shift") motionRef.current.boost = true;
      if (key === "=" || key === "+") motionRef.current.throttleDelta = 1;
      if (key === "-" || key === "_") motionRef.current.throttleDelta = -1;
      if (key === "e") performInteract();
      if (key === "g") performAction("gear");
      if (key === "t") performAction("stage");
      if (key === "escape") syncPaused(true);
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "a", "d"].includes(key)) motionRef.current.x = 0;
      if (["arrowup", "arrowdown", "w", "s"].includes(key)) motionRef.current.y = 0;
      if (key === " ") motionRef.current.jump = false;
      if (key === " " || key === "b") motionRef.current.brake = false;
      if (key === "shift") motionRef.current.boost = false;
      if (["=", "+", "-", "_"].includes(key)) motionRef.current.throttleDelta = 0;
    };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); motionRef.current = { ...NO_INPUT }; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, paused]);

  const start = (destination: Destination) => {
    if (!canChoose(destination, progressRef.current)) { setMessage("Finish your Moon mission first to unlock Mars."); return; }
    setSelectedDestination(destination);
    syncMission(preparedMission(destination, progressRef.current));
    syncPaused(false); syncView("game"); setMessage(null); playCue(440);
  };
  const continueSaved = () => {
    if (!savedMission) return;
    syncMission(savedMission); syncPaused(false); syncView("game"); setMessage("Your locally saved flight has resumed.");
  };
  const backToMenu = () => {
    if (missionRef.current && !["complete", "failed"].includes(missionRef.current.stage)) {
      const snapshot = { ...missionRef.current };
      setSavedMission(snapshot);
      try { window.localStorage.setItem(MISSION_KEY, JSON.stringify(snapshot)); } catch { /* Private browsing */ }
    }
    syncPaused(false); syncView("menu"); setMessage(null); motionRef.current = { ...NO_INPUT };
  };
  const performAction = (name: "stage" | "transfer" | "gear" | "retry" | "eva") => {
    const m = missionRef.current;
    if (!m) return;
    const next = action(m, name);
    if (next !== m) { syncMission(next); setMessage(next.message); playCue(name === "stage" ? 660 : 520); }
  };
  const performInteract = () => {
    const m = missionRef.current;
    if (!m) return;
    const next = interact(m);
    if (next.stage === "complete" && m.stage !== "complete") {
      next.awarded = !progressRef.current.completed.includes(next.destination);
      syncProgress(recordSuccess(award(progressRef.current, next), next));
    }
    syncMission(next); setMessage(next.message);
    if (next.samples > m.samples || next.stage === "complete") playCue(740);
  };
  const changeMode = (mode: HandlingMode) => {
    const next = { ...progressRef.current, mode };
    syncProgress(next);
    setMessage(`${mode === "explorer" ? "Explorer" : "Pilot"} handling selected for new missions.`);
  };
  const resetForNewMission = () => {
    const m = missionRef.current;
    start(m?.destination ?? selectedDestination);
  };
  const purchase = (item: ShopItem) => {
    const result = buyItem(progressRef.current, item);
    if (result.ok) { syncProgress(result.progress); playCue(610); }
    setMessage(result.message);
  };
  const activateKit = (item: "fuelCell" | "repairKit") => {
    const activeMission = viewRef.current === "game" ? missionRef.current : null;
    const result = useItem(progressRef.current, activeMission, item);
    if (result.ok) {
      syncProgress(result.progress);
      if (result.mission) syncMission(result.mission);
      playCue(720);
    }
    setMessage(result.message);
  };
  const gameBackground = backgroundFor(mission);

  return (
    <main className="relative h-[100dvh] min-h-[410px] w-full overflow-hidden bg-[#020715] text-white" style={{ touchAction: "pan-y" }}>
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url("${view === "game" ? gameBackground : "/gigaorbit/launch-cockpit.webp"}")`, filter: view === "game" ? "brightness(.46) saturate(1.17)" : "brightness(.37) saturate(1.2)" }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-[#030717]/40 to-[#040719]/70" />

      {view !== "game" && (
        <div className="relative z-10 flex h-full flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#030a20]/65 px-3 py-2.5 backdrop-blur-md sm:px-7" style={{ paddingTop: "max(.6rem, env(safe-area-inset-top))" }}>
            <div className="flex items-center gap-2.5">
              <Image src="/gigaorbit/gigaorbit-icon.webp" alt="GigaOrbit logo" width={48} height={48} className="size-10 rounded-xl border border-cyan-300/40 object-cover sm:size-12" priority />
              <div><p className="text-base font-black leading-none tracking-tight sm:text-xl">GigaOrbit</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.24em] text-cyan-300">Beyond Earth · Giga3 AI</p></div>
            </div>
            <Link href="/" className="rounded-lg border border-white/25 bg-[#07132b]/60 px-3 py-2 text-xs font-bold hover:bg-white/10">Exit to SmartMap</Link>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-7 pt-6 sm:px-9">
            <div className="mx-auto max-w-6xl">
              {view === "menu" && (
                <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-center">
                  <section className="space-y-4 pt-2 sm:space-y-6 sm:pt-10">
                    <span className="inline-flex rounded-full border border-cyan-300/45 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-200">Play now · Browser 3D mission</span>
                    <h1 className="max-w-3xl text-5xl font-black tracking-[-.045em] text-white drop-shadow-xl sm:text-7xl">Giga<span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">Orbit</span><span className="block text-[.50em] font-bold tracking-normal">Beyond Earth</span></h1>
                    <p className="text-lg font-extrabold text-cyan-200">Launch. Explore. Discover.</p>
                    <p className="max-w-lg text-sm leading-7 text-slate-200 sm:text-base">Pilot a real-time 3D rocket from Earth, navigate space, land safely, walk on the Moon and collect research samples. Earn credits and unlock Mars.</p>
                    <div className="flex flex-wrap gap-3">
                      <PrimaryButton onClick={() => start("moon")}>🚀 START EARTH → MOON</PrimaryButton>
                      {savedMission && <PrimaryButton outline onClick={continueSaved}>▶ CONTINUE SAVED FLIGHT</PrimaryButton>}
                    </div>
                    <p className="text-xs text-slate-300">No login or real-money payment. Earn virtual coins, collect awards, buy fuel and repair equipment. Saves stay on this device.</p>
                  </section>
                  <section className="rounded-2xl border border-cyan-300/35 bg-[#060e28]/85 p-4 shadow-[0_8px_42px_rgba(0,0,0,.4)] backdrop-blur-xl sm:p-6">
                    <p className="text-xs font-extrabold uppercase tracking-[.2em] text-cyan-300">Mission dashboard</p>
                    <div className="relative my-4 aspect-[16/9] overflow-hidden rounded-xl border border-white/15">
                      <Image src="/gigaorbit/mission-flow.webp" alt="Earth-to-Moon mission concept" fill sizes="340px" className="object-cover" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-white/10 p-2"><p className="text-xl font-black text-cyan-200">{progress.credits}</p><p className="text-[10px]">🪙 Coins</p></div>
                      <div className="rounded-lg bg-white/10 p-2"><p className="text-xl font-black text-cyan-200">{progress.xp}</p><p className="text-[10px]">XP</p></div>
                      <div className="rounded-lg bg-white/10 p-2"><p className="text-xl font-black text-cyan-200">{progress.completed.length}/2</p><p className="text-[10px]">Missions</p></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <PrimaryButton outline onClick={() => syncView("workshop")}>🛠️ ROCKET WORKSHOP</PrimaryButton>
                      <PrimaryButton outline onClick={() => syncView("awards")}>🏆 AWARDS & PRIZES</PrimaryButton>
                      <PrimaryButton outline onClick={() => syncView("map")}>🪐 DESTINATIONS</PrimaryButton>
                      <PrimaryButton outline onClick={() => syncView("help")}>🎮 HOW TO PLAY</PrimaryButton>
                      <PrimaryButton outline onClick={() => syncView("settings")}>⚙ SETTINGS</PrimaryButton>
                      <PrimaryButton outline onClick={() => start("mars")} disabled={!canChoose("mars", progress)}>🔴 MARS</PrimaryButton>
                    </div>
                    {!canChoose("mars", progress) && <p className="mt-3 text-xs text-amber-200">🔒 Complete the Moon mission to unlock Mars.</p>}
                  </section>
                </div>
              )}
              {view === "map" && (
                <section>
                  <div className="mb-5 flex items-center justify-between gap-3"><h1 className="text-2xl font-black sm:text-4xl">Solar system missions</h1><PrimaryButton outline onClick={() => syncView("menu")}>← HOME</PrimaryButton></div>
                  <p className="mb-4 text-sm text-slate-200">Progressively unlock new worlds. Missions not built yet are clearly marked as planned.</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {destinations.map((d) => {
                      const unlocked = d.body === "earth" || d.body === "moon" || (d.body === "mars" && canChoose("mars", progress));
                      const playable = d.body === "moon" || d.body === "mars";
                      return <div key={d.body} className="rounded-xl border border-white/20 bg-slate-950/75 p-3">
                        <div className="mb-3 text-4xl">{({ earth: "🌍", moon: "🌕", mars: "🔴", venus: "🟠", mercury: "🌑", jupiter: "🪐", saturn: "🪐", uranus: "🔵", neptune: "🔵" } as Record<string,string>)[d.body]}</div>
                        <p className="text-lg font-black">{d.name}</p><p className="min-h-10 text-xs leading-5 text-slate-300">{d.status}</p>
                        {playable ? <button type="button" disabled={!unlocked} onClick={() => start(d.body as Destination)} className="mt-3 min-h-11 w-full rounded-lg bg-cyan-300 px-2 text-sm font-extrabold text-[#051328] disabled:bg-slate-700 disabled:text-slate-400">{unlocked ? "PLAY MISSION" : "🔒 LOCKED"}</button> : <p className="mt-3 rounded-lg border border-white/20 px-2 py-3 text-center text-xs text-slate-300">{d.body === "earth" ? "Launch from Earth" : "COMING LATER"}</p>}
                      </div>;
                    })}
                  </div>
                </section>
              )}
              {view === "help" && (
                <section className="mx-auto max-w-3xl rounded-2xl border border-cyan-300/30 bg-slate-950/85 p-5 sm:p-9">
                  <h1 className="text-3xl font-black">Pilot training academy</h1>
                  <div className="relative mt-4 h-36 overflow-hidden rounded-xl border border-white/20 sm:h-52">
                    <Image src="/gigaorbit/astronaut-eva.webp" alt="Astronaut space expedition concept used as flight training artwork" fill sizes="(max-width: 640px) 100vw, 760px" className="object-cover object-center" />
                  </div>
                  <p className="mt-3 leading-7 text-slate-200">1. Tap START and steer with the left joystick. Hold THRUST + or THRUST − to change engine power. BOOST gives an extra push but uses fuel.</p>
                  <p className="mt-3 leading-7 text-slate-200">2. At 25 km, tap STAGE to separate the booster. Reach orbit and tap BEGIN TRANSFER.</p>
                  <p className="mt-3 leading-7 text-slate-200">3. During descent, deploy GEAR, use BRAKE to reduce speed, and steer toward the landing zone.</p>
                  <p className="mt-3 leading-7 text-slate-200">4. On the surface, drag the joystick to walk. Tap COLLECT near glowing samples, then return to the lander.</p>
                  <p className="mt-3 text-xs text-cyan-200">Keyboard: arrows / WASD to move, T stage, G landing gear, E interact, Space brake, Shift boost, Esc pause.</p>
                  <div className="mt-5 flex flex-wrap gap-3"><PrimaryButton onClick={() => start("moon")}>START TRAINING MISSION</PrimaryButton><PrimaryButton outline onClick={() => syncView("menu")}>BACK</PrimaryButton></div>
                </section>
              )}
              {view === "settings" && (
                <section className="mx-auto max-w-xl rounded-2xl border border-cyan-300/30 bg-slate-950/85 p-6 sm:p-9">
                  <h1 className="text-3xl font-black">Flight settings</h1><p className="mt-3 text-slate-200">Choose handling for your next expedition.</p>
                  <div className="mt-5 flex flex-wrap gap-2"><PrimaryButton outline={progress.mode !== "explorer"} onClick={() => changeMode("explorer")}>EXPLORER MODE</PrimaryButton><PrimaryButton outline={progress.mode !== "pilot"} onClick={() => changeMode("pilot")}>PILOT MODE</PrimaryButton></div>
                  <p className="mt-4 text-sm text-slate-300">Explorer offers gentle steering assistance and landing stabilization. Pilot gives more manual control.</p>
                  <div className="mt-6 flex flex-wrap gap-2"><PrimaryButton outline onClick={() => setMute((v) => !v)}>{mute ? "🔇 EFFECTS OFF" : "🔊 EFFECTS ON"}</PrimaryButton><PrimaryButton onClick={() => syncView("menu")}>SAVE & BACK</PrimaryButton></div>
                  <p className="mt-3 text-xs text-slate-400">Original synthetic mission chimes play after user actions when effects are on. No streamed music is required.</p>
                </section>
              )}
              {message && <p role="status" className="mt-4 rounded-lg bg-[#142e40]/85 p-3 text-sm text-cyan-200">{message}</p>}
            </div>
          </div>
        </div>
      )}

      {view === "game" && mission && (
        <div className="absolute inset-0 overflow-hidden" style={{ touchAction: "none" }}>
          <div className="absolute inset-0 z-[1]"><Scene mission={mission} /></div>
          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-[#010715]/50 via-transparent to-[#02091b]/65" />
          <header className="pointer-events-none absolute inset-x-0 top-0 z-[5] flex items-start justify-between gap-2 px-3 pb-2 pt-3 sm:px-6" style={{ paddingTop: "max(.65rem, env(safe-area-inset-top))" }}>
            <div className="max-w-[64%] rounded-xl border border-cyan-300/35 bg-[#03122a]/85 p-2.5 shadow-xl backdrop-blur-sm sm:p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-cyan-300 sm:text-xs">GIGAORBIT · {stageName(mission.stage)}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-white sm:text-sm">{objective(mission)}</p>
            </div>
            <button type="button" onClick={() => syncPaused(true)} className="pointer-events-auto min-h-11 rounded-xl border border-white/35 bg-[#06152f]/90 px-3 text-sm font-black text-white">Ⅱ PAUSE</button>
          </header>

          <div className="pointer-events-none absolute left-3 top-[112px] z-[4] w-[152px] rounded-xl border border-cyan-300/25 bg-[#061327]/80 p-3 text-[11px] shadow-lg backdrop-blur-sm sm:left-6 sm:top-[120px] sm:w-[190px] sm:text-sm">
            {mission.stage === "launch" && <><p>ALTITUDE <strong className="float-right text-cyan-200">{mission.altitudeKm.toFixed(1)} km</strong></p><p className="mt-2">SPEED <strong className="float-right text-cyan-200">{Math.round(mission.speed)} m/s</strong></p></>}
            {mission.stage === "orbit" && <><p>ORBIT <strong className="float-right text-cyan-200">120 km</strong></p><p className="mt-2">STATUS <strong className="float-right text-green-300">STABLE</strong></p></>}
            {mission.stage === "transfer" && <><p>TRANSFER <strong className="float-right text-cyan-200">{Math.round(mission.transfer)}%</strong></p><div className="mt-2 h-2 rounded-full bg-white/20"><div className="h-2 rounded-full bg-cyan-400" style={{ width: `${mission.transfer}%` }} /></div></>}
            {mission.stage === "landing" && <><p>ALTITUDE <strong className="float-right text-cyan-200">{Math.ceil(mission.landingAltitude)} m</strong></p><p className="mt-2">DESCENT <strong className="float-right text-cyan-200">{mission.descent.toFixed(1)} m/s</strong></p><p className="mt-2">TARGET <strong className="float-right text-cyan-200">{Math.abs(mission.offset).toFixed(0)} m</strong></p></>}
            {mission.stage === "eva" && <><p>SAMPLES <strong className="float-right text-cyan-200">{mission.samples}/{SAMPLE_POINTS[mission.destination].length}</strong></p><p className="mt-2">TO TARGET <strong className="float-right text-cyan-200">{Math.round(sampleDistance(mission))} m</strong></p></>}
            <p className="mt-3 border-t border-white/15 pt-2">FUEL <strong className="float-right text-cyan-200">{Math.round(mission.fuel)}%</strong></p>
            <div className="mt-1 h-1.5 rounded-full bg-white/15"><div className="h-1.5 rounded-full bg-cyan-400" style={{ width: `${mission.fuel}%` }}/></div>
          </div>

          {mission.stage === "orbit" && <div className="pointer-events-auto absolute bottom-[11%] left-1/2 z-[7] w-max max-w-[94%] -translate-x-1/2"><PrimaryButton onClick={() => performAction("transfer")}>🪐 BEGIN {mission.destination.toUpperCase()} TRANSFER</PrimaryButton></div>}
          {mission.stage === "complete" && <div className="absolute inset-0 z-[9] grid place-items-center bg-[#03091d]/88 p-4 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-3xl border border-cyan-200/40 bg-gradient-to-br from-[#0b2746] to-[#1b1240] p-6 text-center shadow-2xl">
              <p className="text-5xl">🏆</p><h2 className="mt-3 text-3xl font-black">MISSION COMPLETED!</h2>
              <p className="mt-3 text-cyan-100">Samples returned safely from the {mission.destination === "moon" ? "Moon" : "Martian surface"}.</p>
              <p className="mt-3 text-lg font-black text-amber-300">{mission.awarded ? `+${mission.destination === "moon" ? 500 : 800} credits · +${mission.destination === "moon" ? 200 : 350} XP` : "Replay complete · First-clear rewards already secured"}</p>
              <p className="mt-2 text-xs text-slate-300">First-completion rewards are awarded once. Mars unlocks after the Moon.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <PrimaryButton onClick={() => { setSavedMission(null); backToMenu(); }}>MISSION CONTROL</PrimaryButton>
                <PrimaryButton outline onClick={() => start(mission.destination === "moon" ? "mars" : "moon")} disabled={mission.destination === "moon" && !canChoose("mars", progress)}>NEXT MISSION</PrimaryButton>
              </div>
            </div>
          </div>}
          {mission.stage === "failed" && <div className="absolute inset-0 z-[9] grid place-items-center bg-[#03091d]/85 p-4">
            <div className="w-full max-w-md rounded-3xl border border-orange-400/50 bg-[#101932] p-6 text-center">
              <p className="text-4xl">⚠️</p><h2 className="mt-3 text-2xl font-black">MISSION INTERRUPTED</h2>
              <p className="mt-3 text-sm text-orange-100">{mission.message}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3"><PrimaryButton onClick={resetForNewMission}>RETRY FOR FREE</PrimaryButton><PrimaryButton outline onClick={backToMenu}>MAIN MENU</PrimaryButton></div>
            </div>
          </div>}
          {!["complete", "failed", "orbit"].includes(mission.stage) && !paused && (
            <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[5] flex items-end justify-between gap-2 px-3 pb-8 sm:px-8 sm:pb-11" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
              <Joystick onChange={(val) => { motionRef.current.x = val.x; motionRef.current.y = val.y; }} />
              <div className="flex max-w-[58%] flex-col items-end gap-2">
                {mission.stage === "launch" && (
                  <>
                    <div className="rounded-lg border border-white/20 bg-[#061427]/80 px-2 py-1 text-xs font-black">THRUST {Math.round(mission.throttle * 100)}%</div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <HoldButton label="THRUST −" color="gray" onStart={() => { motionRef.current.throttleDelta = -1; }} onEnd={() => { motionRef.current.throttleDelta = 0; }} />
                      <HoldButton label="THRUST +" onStart={() => { motionRef.current.throttleDelta = 1; }} onEnd={() => { motionRef.current.throttleDelta = 0; }} />
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <HoldButton label="BOOST" color="orange" onStart={() => { motionRef.current.boost = true; }} onEnd={() => { motionRef.current.boost = false; }} />
                      <button type="button" disabled={mission.altitudeKm < 25 || mission.staged} onClick={() => performAction("stage")} className="min-h-11 rounded-xl border border-cyan-100 bg-cyan-300 px-4 text-xs font-black text-[#061328] disabled:opacity-40">{mission.staged ? "STAGED ✓" : "STAGE"}</button>
                    </div>
                  </>
                )}
                {mission.stage === "transfer" && (
                  <>
                    <div className="flex flex-wrap justify-end gap-2">
                      <HoldButton label="THRUST −" onStart={() => { motionRef.current.throttleDelta = -1; }} onEnd={() => { motionRef.current.throttleDelta = 0; }} />
                      <HoldButton label="THRUST +" onStart={() => { motionRef.current.throttleDelta = 1; }} onEnd={() => { motionRef.current.throttleDelta = 0; }} />
                    </div>
                    <HoldButton label="BOOST BURN" color="orange" onStart={() => { motionRef.current.boost = true; }} onEnd={() => { motionRef.current.boost = false; }} />
                  </>
                )}
                {mission.stage === "landing" && (
                  <>
                    <div className="rounded-lg border border-white/20 bg-[#061427]/80 px-2 py-1 text-xs">THRUST {Math.round(mission.throttle * 100)}%</div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <HoldButton label="THRUST −" onStart={() => { motionRef.current.throttleDelta = -1; }} onEnd={() => { motionRef.current.throttleDelta = 0; }} />
                      <HoldButton label="THRUST +" onStart={() => { motionRef.current.throttleDelta = 1; }} onEnd={() => { motionRef.current.throttleDelta = 0; }} />
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <HoldButton label="BRAKE" color="orange" onStart={() => { motionRef.current.brake = true; }} onEnd={() => { motionRef.current.brake = false; }} />
                      <button type="button" disabled={mission.gear} onClick={() => performAction("gear")} className="min-h-11 rounded-xl bg-cyan-300 px-3 text-xs font-black text-[#061328] disabled:bg-emerald-600 disabled:text-white">{mission.gear ? "GEAR ✓" : "DEPLOY GEAR"}</button>
                    </div>
                  </>
                )}
                {mission.stage === "eva" && (
                  <>
                    <p className="max-w-[180px] rounded-lg bg-[#06142b]/80 p-2 text-right text-[11px] text-cyan-100">{mission.samples === SAMPLE_POINTS[mission.destination].length ? "Return to the rocket (0,0)" : "Follow the glowing cyan sample"}</p>
                    <div className="flex gap-2">
                      <HoldButton label="RUN" color="gray" onStart={() => { motionRef.current.boost = true; }} onEnd={() => { motionRef.current.boost = false; }} />
                      <HoldButton label="JUMP" color="orange" onStart={() => { motionRef.current.jump = true; }} onEnd={() => { motionRef.current.jump = false; }} />
                    </div>
                    <button type="button" onClick={performInteract} disabled={!canInteract(mission)} className="min-h-[54px] rounded-xl border border-white/30 bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-black text-[#06162c] disabled:cursor-not-allowed disabled:opacity-55">{mission.samples === SAMPLE_POINTS[mission.destination].length ? "RETURN SAMPLE" : "COLLECT SAMPLE"}</button>
                  </>
                )}
              </div>
            </div>
          )}
          {paused && <div className="absolute inset-0 z-[9] grid place-items-center bg-[#010617]/90 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-cyan-300/40 bg-[#101931] p-6 text-center">
              <h2 className="text-3xl font-black">PAUSED</h2><p className="my-3 text-sm text-slate-300">Your mission and progress are saved on this device.</p>
              <div className="flex flex-col gap-3"><PrimaryButton onClick={() => syncPaused(false)}>RESUME MISSION</PrimaryButton><PrimaryButton outline onClick={resetForNewMission}>RESTART MISSION</PrimaryButton><PrimaryButton outline onClick={backToMenu}>SAVE & MAIN MENU</PrimaryButton></div>
            </div>
          </div>}
          {message && !paused && !["complete", "failed"].includes(mission.stage) && <div role="status" className="pointer-events-none absolute left-1/2 top-[76px] z-[6] w-[min(92vw,470px)] -translate-x-1/2 rounded-lg bg-[#072542]/75 px-3 py-1.5 text-center text-[10px] font-semibold text-cyan-100 sm:text-xs">{message}</div>}
          <p className="pointer-events-none absolute bottom-1.5 left-1/2 z-[4] w-max -translate-x-1/2 text-[9px] tracking-wide text-slate-300">GIGAORBIT WEB · 3D ARCADE PROTOTYPE</p>
        </div>
      )}
    </main>
  );
}
