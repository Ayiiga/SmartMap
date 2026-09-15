"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useGamification } from "@/stores/app-store";
import { useAuth } from "@/hooks/use-auth";
import { generateCertificate } from "@/lib/community";

export default function CertificatesPage() {
  const gamification = useGamification();
  const { user } = useAuth();
  const learnerName = user?.user_metadata?.full_name ?? "Smart Map Learner";

  const certificates = [
    generateCertificate(gamification, learnerName, "Smart Map Learning Certificate"),
    ...(gamification.badges.length >= 3
      ? [generateCertificate(gamification, learnerName, "Achievement Excellence Certificate")]
      : []),
    ...(gamification.streak >= 7
      ? [generateCertificate(gamification, learnerName, "7-Day Streak Certificate")]
      : []),
  ];

  const handlePrint = (certId: string) => {
    const el = document.getElementById(certId);
    if (!el) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Certificate</title></head><body>${el.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-giga-purple hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <h1 className="font-display text-3xl font-bold">Digital Certificates</h1>
      <p className="mt-2 text-giga-muted">Your achievement portfolio — printable and shareable</p>

      {certificates.length === 0 ? (
        <p className="mt-8 text-giga-muted">Complete lessons and earn badges to unlock certificates.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {certificates.map((cert, i) => (
            <motion.div key={cert.id} id={cert.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassCard className="text-center p-8 border-2 border-giga-purple/20">
                <p className="text-sm font-bold text-giga-purple uppercase tracking-widest">Smart Map</p>
                <h2 className="font-display text-2xl font-bold mt-4">{cert.title}</h2>
                <p className="mt-6 text-lg">Awarded to</p>
                <p className="font-display text-3xl font-bold text-gradient mt-2">{cert.learnerName}</p>
                <p className="mt-6 text-giga-muted">
                  Level {cert.level} · {cert.xp} XP · {new Date(cert.earnedAt).toLocaleDateString()}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => handlePrint(cert.id)}>
                    <Printer className="h-4 w-4" /> Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${cert.id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold mb-4">Achievement Portfolio</h2>
        <div className="flex flex-wrap gap-2">
          {gamification.badges.map((badge) => (
            <span key={badge.id} className="rounded-xl bg-giga-purple/10 px-4 py-2 text-sm font-semibold" title={badge.description}>
              {badge.icon} {badge.name}
            </span>
          ))}
          {gamification.badges.length === 0 && (
            <p className="text-sm text-giga-muted">Badges you earn will appear in your portfolio.</p>
          )}
        </div>
      </div>
    </div>
  );
}
