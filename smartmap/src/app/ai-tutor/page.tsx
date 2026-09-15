"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { AI_FEATURES } from "@/content/curriculum";
import { getOfflineAIResponse } from "@/lib/ai/offline-responses";
import { fetchJsonWithRetry } from "@/lib/network/fetch-with-retry";
import { withBasePath } from "@/lib/base-path";
import type { AIFeatureRequest } from "@/types";

const isStaticHosting = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
const VALID_FEATURES = new Set(AI_FEATURES.map((f) => f.id));

function AITutorContent() {
  const searchParams = useSearchParams();
  const featureParam = searchParams.get("feature");
  const initialFeature = featureParam && VALID_FEATURES.has(featureParam)
    ? (featureParam as AIFeatureRequest["feature"])
    : "reading_coach";

  const [selectedFeature, setSelectedFeature] = useState<AIFeatureRequest["feature"]>(initialFeature);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (featureParam && VALID_FEATURES.has(featureParam)) {
      setSelectedFeature(featureParam as AIFeatureRequest["feature"]);
    }
  }, [featureParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");
    setError(null);

    try {
      if (isStaticHosting) {
        setResponse(getOfflineAIResponse({ feature: selectedFeature, input }));
        return;
      }

      const data = await fetchJsonWithRetry<{ response?: string; error?: string }>(
        withBasePath("/api/ai"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feature: selectedFeature, input }),
          retries: 2,
        },
      );
      if (data.error) {
        setError(data.error);
        setResponse(getOfflineAIResponse({ feature: selectedFeature, input }));
        return;
      }
      setResponse(data.response ?? "Something went wrong.");
    } catch {
      setError("We could not reach the AI tutor. Showing an offline response instead.");
      setResponse(getOfflineAIResponse({ feature: selectedFeature, input }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center mb-10">
        <span className="text-5xl">🤖</span>
        <h1 className="font-display mt-4 text-3xl font-bold">AI Tutor</h1>
        <p className="mt-2 text-giga-muted">Your friendly AI learning assistant</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {AI_FEATURES.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFeature(f.id as AIFeatureRequest["feature"])}
            className={`rounded-xl p-4 text-left transition-all min-h-[80px] ${
              selectedFeature === f.id
                ? "bg-gradient-to-br from-giga-purple to-giga-blue text-white shadow-lg"
                : "bg-white border border-giga-border hover:border-giga-purple dark:bg-giga-surface"
            }`}
          >
            <span className="text-2xl">{f.icon}</span>
            <p className="mt-2 font-bold text-sm">{f.title}</p>
          </button>
        ))}
      </div>

      <Card className="p-6 sm:p-8">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-giga-purple" />
          Ask your AI Tutor
        </CardTitle>
        <CardDescription className="mt-2">
          {AI_FEATURES.find((f) => f.id === selectedFeature)?.description}
        </CardDescription>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or paste text to practice..."
            className="w-full rounded-xl border border-giga-border p-4 min-h-[120px] dark:bg-giga-surface focus:ring-4 focus:ring-giga-purple/20"
            required
          />
          <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
            Get AI Help
          </Button>
        </form>

        {error && (
          <p className="mt-4 rounded-xl bg-giga-orange/10 px-4 py-3 text-sm text-giga-orange" role="alert">
            {error}
          </p>
        )}

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl bg-giga-purple/5 p-6 dark:bg-giga-purple/10"
          >
            <p className="whitespace-pre-wrap leading-relaxed">{response}</p>
          </motion.div>
        )}
      </Card>
    </div>
  );
}

export default function AITutorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading AI Tutor...</div>}>
      <AITutorContent />
    </Suspense>
  );
}
