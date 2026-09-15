"use client";

import { useEffect } from "react";
import { Siren } from "lucide-react";
import { useMapStore } from "@/stores/map-store";
import { triggerSosShare, formatSosLocation } from "@/lib/safety/sos-share";
import { BEDOMASE_COORDINATES } from "@/content/smart-map/ghana-route-steps";

export function SosEmergencyButton() {
  const sosActive = useMapStore((s) => s.sosActive);
  const setSosActive = useMapStore((s) => s.setSosActive);
  const userLocation = useMapStore((s) => s.userLocation);
  const emergencyContacts = useMapStore((s) => s.emergencyContacts);

  const coords = userLocation ?? BEDOMASE_COORDINATES;

  useEffect(() => {
    if (!sosActive) return;
    if (emergencyContacts.length === 0) return;
    triggerSosShare(coords, emergencyContacts);
  }, [sosActive, coords, emergencyContacts]);

  return (
    <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-sm-danger to-[#9f1239] p-5 text-white shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold opacity-90">Emergency SOS</p>
          <h2 className="font-display text-2xl font-extrabold">Need help now?</h2>
        </div>
        <Siren className="h-8 w-8" />
      </div>
      <button
        type="button"
        onClick={() => setSosActive(!sosActive)}
        className={`sm-sos-pulse mt-5 flex h-32 w-full items-center justify-center rounded-[1.75rem] text-2xl font-black tracking-wide ${
          sosActive ? "bg-white text-sm-danger" : "bg-white/15 backdrop-blur"
        }`}
      >
        {sosActive ? "SOS ACTIVE — SHARING GPS" : "TAP SOS"}
      </button>
      {sosActive && (
        <p className="mt-3 text-sm text-white/90">
          Sharing live GPS {formatSosLocation(coords)} via WhatsApp + SMS
          {emergencyContacts.length > 0
            ? ` to ${emergencyContacts[0].name}`
            : " — add an emergency contact below"}
          .
        </p>
      )}
    </section>
  );
}
