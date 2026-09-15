import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GigaTrend TV Browser",
  description: "Watch official live TV, sports, and movie channels in the GigaTrend TV in-app browser.",
};

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
