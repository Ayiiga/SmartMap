import type { Metadata } from "next";
import { MediaPageShell, SectionHeader } from "@/components/media/section-header";
import { RadioPlayerCard } from "@/components/media/radio-player";
import { RADIO_COUNTRIES, getRadioByCountry } from "@/content/media/radio";

export const metadata: Metadata = {
  title: "Live Radio",
  description: "Listen to live radio from Ghana, Nigeria, Kenya, South Africa, and international stations.",
};

export default function LiveRadioPage() {
  return (
    <MediaPageShell title="Live Radio" subtitle="Play, pause, volume control, and favourites">
      {RADIO_COUNTRIES.map((country) => {
        const stations = getRadioByCountry(country);
        return (
          <section key={country} className="mb-8">
            <SectionHeader title={country} />
            <div className="grid gap-3 sm:grid-cols-2">
              {stations.map((station) => (
                <RadioPlayerCard key={station.id} station={station} />
              ))}
            </div>
          </section>
        );
      })}
    </MediaPageShell>
  );
}
