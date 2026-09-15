import Link from "next/link";

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-sm-primary dark:text-white">Smart Map API</h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        Programmatic access for partners. Phase-gated features remain disabled until flags are approved.
      </p>
      <pre className="mt-5 overflow-x-auto rounded-3xl bg-[#071827] p-4 text-xs text-emerald-200">
{`GET  /api/health
POST /api/ai      { "feature": "map_assistant", "input": "..." }  # Phase 3+
POST /api/sync
POST /api/log

# Planned partner endpoints (Phase 4–6)
GET  /api/v1/places?category=hospital
GET  /api/v1/services/government
GET  /api/v1/transport
POST /api/v1/trips
GET  /api/v1/countries
GET  /api/v1/incidents`}
      </pre>
      <p className="mt-4 text-sm">
        Contact{" "}
        <Link href="/contact" className="font-bold text-sm-primary">
          partnerships
        </Link>{" "}
        for API keys and rate limits.
      </p>
    </div>
  );
}
