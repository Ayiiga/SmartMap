import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownToLine, ArrowRight, Orbit, Rocket, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "GigaOrbit: Beyond Earth | Giga3 AI",
  description:
    "Discover GigaOrbit: Beyond Earth, a Godot-powered offline Android rocket and planetary exploration adventure. Preview the Earth-to-Moon mission and original visual concepts.",
  openGraph: {
    title: "GigaOrbit: Beyond Earth",
    description: "Launch. Explore. Discover. An offline Android space adventure by Giga3 AI.",
    images: [{ url: "/gigaorbit/gigaorbit-icon.webp", width: 1440, height: 1440, alt: "GigaOrbit orbital G emblem" }],
  },
};

const scenes = [
  { src: "/gigaorbit/mission-overview.webp", title: "Mission control", caption: "From crew selection to planetary discovery", shape: "wide" },
  { src: "/gigaorbit/mission-flow.webp", title: "Earth-to-Moon journey", caption: "Launch, fly, land and explore", shape: "wide" },
  { src: "/gigaorbit/earth-orbit.webp", title: "Earth from orbit", caption: "A cinematic view of our home planet", shape: "portrait" },
  { src: "/gigaorbit/astronaut-eva.webp", title: "Astronaut adventure", caption: "Research and discovery beyond Earth", shape: "portrait" },
  { src: "/gigaorbit/launch-rocket.webp", title: "Rocket launch", caption: "Ignition, thrust and a spectacular liftoff", shape: "portrait" },
  { src: "/gigaorbit/lunar-rover.webp", title: "Lunar rover concept", caption: "Future vehicle-based surface exploration", shape: "portrait" },
] as const;

const steps = [
  { number: "01", title: "Assemble your crew", copy: "Choose astronauts and prepare your rocket." },
  { number: "02", title: "Launch and pilot", copy: "Control thrust and steer with touch-friendly controls." },
  { number: "03", title: "Travel to the Moon", copy: "Take a guided, time-compressed planetary journey." },
  { number: "04", title: "Land and explore", copy: "Pilot the descent, walk on the Moon and return a sample." },
] as const;

export default function GigaOrbitPage() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#050918] text-[#f3f8ff]">
      <div className="pointer-events-none absolute left-[-15%] top-[-13rem] h-[34rem] w-[44rem] rounded-full bg-[#164bb5]/20 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-15%] top-[28rem] h-[29rem] w-[38rem] rounded-full bg-[#7d35ff]/15 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#080e29]">
              <Image src="/gigaorbit/gigaorbit-icon.webp" alt="GigaOrbit orbital G emblem" fill priority sizes="48px" className="object-cover" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">GigaOrbit</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300">Beyond Earth</p>
            </div>
          </div>
          <nav aria-label="GigaOrbit navigation" className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
            <a href="#mission" className="rounded-full px-3 py-2 hover:text-cyan-300">Mission</a>
            <a href="#gallery" className="rounded-full px-3 py-2 hover:text-cyan-300">Gallery</a>
            <a href="#android" className="rounded-full border border-cyan-400/40 bg-cyan-300/10 px-4 py-2 font-semibold text-cyan-100 hover:bg-cyan-300/20">Android preview</a>
          </nav>
        </header>

        <section aria-labelledby="hero-heading" className="grid items-center gap-8 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
              <Orbit size={16} /> Offline Android space adventure
            </p>
            <h1 id="hero-heading" className="text-5xl font-black leading-[1.04] tracking-[-0.055em] sm:text-7xl">
              Giga<span className="bg-gradient-to-r from-cyan-200 via-sky-400 to-violet-400 bg-clip-text text-transparent">Orbit.</span>
              <span className="mt-2 block text-3xl font-bold tracking-[-0.035em] text-slate-200 sm:text-5xl">Beyond Earth</span>
            </h1>
            <p className="text-xl font-semibold tracking-wide text-cyan-300">Launch. Explore. Discover.</p>
            <p className="max-w-xl text-base leading-8 text-slate-300">
              Build your rocket. Lift off from Earth. Pilot toward the Moon, land your spacecraft and
              explore another world as an astronaut. Your next great mission begins here.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#android" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-[0_0_36px_rgba(34,211,238,.18)] hover:brightness-110">
                <Rocket size={18} /> Explore Android preview
              </a>
              <a href="#gallery" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-bold hover:border-cyan-300/60 hover:bg-white/5">
                View visuals <ArrowRight size={18} />
              </a>
            </div>
            <div className="flex flex-wrap gap-5 pt-2 text-xs font-semibold text-slate-400">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-cyan-300" /> Offline-first</span>
              <span className="inline-flex items-center gap-2"><Rocket size={16} className="text-cyan-300" /> Built with Godot 4</span>
              <span className="inline-flex items-center gap-2"><Sparkles size={16} className="text-cyan-300" /> By Giga3 AI</span>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.8rem] border border-cyan-300/25 bg-[#081126] shadow-[0_0_90px_rgba(19,108,213,.24)]">
              <Image src="/gigaorbit/launch-cockpit.webp" alt="Concept art of a rocket launching through a futuristic command center" fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-200">Mission preview</p>
                  <p className="mt-1 text-2xl font-black">Earth → Moon</p>
                </div>
                <span className="rounded-full border border-white/20 bg-[#06132c]/70 px-3 py-2 text-xs font-semibold backdrop-blur">Visual concept</span>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden max-w-[170px] rounded-2xl border border-violet-400/30 bg-[#0c1237] p-2 shadow-xl sm:block">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image src="/gigaorbit/gigaorbit-icon.webp" alt="" fill sizes="145px" className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section id="mission" className="scroll-mt-8 py-12">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">The first expedition</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Earth to the Moon</h2>
            </div>
            <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300">Science-inspired · Accessible controls</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.number} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.07]">
                <span className="text-2xl font-black text-cyan-300">{step.number}</span>
                <h3 className="mt-4 text-lg font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="gallery" className="scroll-mt-8 py-12">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">The vision</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Explore the visuals</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            A cinematic design gallery using supplied GigaOrbit artwork and early interface concepts.
            These are visual references, not photographs of verified running gameplay.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.map((scene) => (
              <article key={scene.src} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101936]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#071022]">
                  <Image src={scene.src} alt={scene.title} fill sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-extrabold">{scene.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{scene.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="android" className="scroll-mt-8 py-12">
          <div className="grid gap-8 rounded-[1.8rem] border border-cyan-400/25 bg-gradient-to-br from-[#122751] via-[#101334] to-[#25134a] p-6 sm:p-10 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Android development build</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Pilot the next frontier.</h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-300">
                GigaOrbit is under active development. A debug Android APK has passed automated Godot checks,
                but the game has not yet passed final on-device quality assurance or a Google Play release.
              </p>
              <a href="https://github.com/Ayiiga/SmartMap/actions/runs/45029328672" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 text-sm font-extrabold text-slate-950 hover:bg-cyan-200">
                <ArrowDownToLine size={18} /> View Android test build
              </a>
              <p className="mt-3 text-xs text-slate-400">GitHub Actions ZIP artifact · May require GitHub sign-in · Not a public production release.</p>
            </div>
            <div className="flex flex-col justify-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-6">
              <p className="text-sm font-bold text-cyan-200">What comes next</p>
              <p className="text-sm leading-7 text-slate-300">More polished rocket controls, lunar surface discovery, Mars exploration, rovers and optimized 3D graphics.</p>
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-cyan-400 underline-offset-4 hover:text-cyan-200">
                Return to SmartMap <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
        <footer className="border-t border-white/10 pt-6 text-xs leading-6 text-slate-400">
          <p>© {new Date().getUTCFullYear()} Giga3 AI · GigaOrbit: Beyond Earth · Launch. Explore. Discover.</p>
          <p>Some supplied early concepts contain old “Space Odyssey” branding or illustrative rewards/leaderboards; those are not live cash-prize claims or confirmed gameplay features.</p>
        </footer>
      </div>
    </main>
  );
}
