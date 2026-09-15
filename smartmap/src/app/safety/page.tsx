"use client";

import { FeatureGate } from "@/components/smart-map/feature-gate";
import { useState } from "react";
import {
  Baby,
  HeartPulse,
  Phone,
  QrCode,
  Share2,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import { getCountry, LAUNCH_COUNTRY } from "@/content/smart-map/countries";
import { useMapStore } from "@/stores/map-store";
import { isValidPhone, sanitizeText } from "@/lib/security/validate";
import { SosEmergencyButton } from "@/components/smart-map/sos-emergency-button";

function SafetyPageContent() {
  const country = getCountry(useMapStore((s) => s.countryCode));
  const womenSafetyMode = useMapStore((s) => s.womenSafetyMode);
  const childSafetyMode = useMapStore((s) => s.childSafetyMode);
  const touristSafetyMode = useMapStore((s) => s.touristSafetyMode);
  const setSafetyModes = useMapStore((s) => s.setSafetyModes);
  const bloodGroup = useMapStore((s) => s.bloodGroup);
  const medicalNotes = useMapStore((s) => s.medicalNotes);
  const setMedical = useMapStore((s) => s.setMedical);
  const emergencyContacts = useMapStore((s) => s.emergencyContacts);
  const addEmergencyContact = useMapStore((s) => s.addEmergencyContact);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shared, setShared] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <header className="sm-fade-up">
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-danger">Smart Safety Center</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Stay safe across Africa
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          One-tap SOS, emergency numbers for {LAUNCH_COUNTRY.flag} {country.name}, live location sharing, and family protection tools.
        </p>
      </header>

      <SosEmergencyButton />

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Police", value: country.emergency.police, href: `tel:${country.emergency.police}` },
          { label: "Fire", value: country.emergency.fire, href: `tel:${country.emergency.fire}` },
          { label: "Ambulance", value: country.emergency.ambulance, href: `tel:${country.emergency.ambulance}` },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="rounded-3xl border border-sm-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <p className="text-xs font-semibold uppercase text-slate-500">{item.label}</p>
            <p className="mt-1 flex items-center gap-2 font-display text-2xl font-extrabold text-sm-primary dark:text-white">
              <Phone className="h-5 w-5 text-sm-emerald" />
              {item.value}
            </p>
          </a>
        ))}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setShared(true)}
          className="flex items-center gap-3 rounded-3xl border border-sm-border bg-white p-4 text-left shadow-sm dark:border-white/10 dark:bg-sm-primary-deep"
        >
          <Share2 className="h-6 w-6 text-sm-primary" />
          <div>
            <p className="font-bold">Share live location</p>
            <p className="text-sm text-slate-500">{shared ? "Link ready to share" : "Send GPS to trusted contacts"}</p>
          </div>
        </button>
        <div className="flex items-center gap-3 rounded-3xl border border-sm-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-sm-primary-deep">
          <QrCode className="h-6 w-6 text-sm-emerald" />
          <div>
            <p className="font-bold">Emergency QR Card</p>
            <p className="text-sm text-slate-500">
              Blood: {bloodGroup || "Not set"} · Medical notes available offline
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="font-display text-xl font-bold">Safety modes</h2>
        {[
          {
            key: "womenSafetyMode" as const,
            label: "Women Safety Mode",
            desc: "Safer route bias, quick SOS, trusted places",
            icon: UserRound,
            value: womenSafetyMode,
          },
          {
            key: "childSafetyMode" as const,
            label: "Child Safety Mode",
            desc: "Family tracking cues and school-safe places",
            icon: Baby,
            value: childSafetyMode,
          },
          {
            key: "touristSafetyMode" as const,
            label: "Tourist Safety Mode",
            desc: "Local emergency guidance and landmark tips",
            icon: Shield,
            value: touristSafetyMode,
          },
        ].map(({ key, label, desc, icon: Icon, value }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSafetyModes({ [key]: !value })}
            className="flex w-full items-center justify-between rounded-3xl border border-sm-border bg-white p-4 text-left dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <span className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-sm-primary" />
              <span>
                <span className="block font-bold">{label}</span>
                <span className="text-sm text-slate-500">{desc}</span>
              </span>
            </span>
            <span className={`h-7 w-12 rounded-full p-1 ${value ? "bg-sm-emerald" : "bg-slate-300"}`}>
              <span className={`block h-5 w-5 rounded-full bg-white transition ${value ? "translate-x-5" : ""}`} />
            </span>
          </button>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
        <div className="mb-3 flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-sm-danger" />
          <h2 className="font-display text-xl font-bold">Medical information</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={bloodGroup ?? ""}
            onChange={(e) => setMedical(e.target.value, medicalNotes)}
            placeholder="Blood group (e.g. O+)"
            className="rounded-2xl border border-sm-border bg-transparent px-4 py-3 outline-none dark:border-white/15"
          />
          <input
            value={medicalNotes ?? ""}
            onChange={(e) => setMedical(bloodGroup, e.target.value)}
            placeholder="Allergies / medical notes"
            className="rounded-2xl border border-sm-border bg-transparent px-4 py-3 outline-none dark:border-white/15"
          />
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-sm-primary" />
          <h2 className="font-display text-xl font-bold">Emergency contacts</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="rounded-2xl border border-sm-border bg-transparent px-4 py-3 outline-none dark:border-white/15"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="rounded-2xl border border-sm-border bg-transparent px-4 py-3 outline-none dark:border-white/15"
          />
          <button
            type="button"
            onClick={() => {
              const cleanName = sanitizeText(name, 80);
              const cleanPhone = sanitizeText(phone, 24);
              if (!cleanName || !isValidPhone(cleanPhone)) return;
              addEmergencyContact({
                id: crypto.randomUUID(),
                name: cleanName,
                phone: cleanPhone,
                relationship: "Trusted",
              });
              setName("");
              setPhone("");
            }}
            className="rounded-2xl bg-sm-primary px-4 py-3 text-sm font-bold text-white"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {emergencyContacts.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
              <span className="font-semibold">{c.name}</span>
              <a href={`tel:${c.phone}`} className="text-sm-primary font-bold">
                {c.phone}
              </a>
            </li>
          ))}
          {emergencyContacts.length === 0 && (
            <li className="text-sm text-slate-500">No contacts yet. Add family or roadside assistance numbers.</li>
          )}
        </ul>
      </section>
    </div>
  );
}


export default function SafetyPage() {
  return (
    <FeatureGate
      flag="publicSafetyPhase2"
      title="Smart Safety Center"
      phase="Phase 2"
      description="SOS, emergency contacts, live location sharing, and family safety tools are ready behind the Phase 2 flag."
    >
      <SafetyPageContent />
    </FeatureGate>
  );
}
