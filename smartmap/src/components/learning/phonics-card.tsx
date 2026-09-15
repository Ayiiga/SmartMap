"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Mic, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, SpeechRecognizer } from "@/lib/speech";
import { cn } from "@/lib/utils";

interface PhonicsCardProps {
  grapheme: string;
  sound: string;
  example: string;
  type: string;
  onMastered?: () => void;
}

export function PhonicsCard({ grapheme, sound, example, type, onMastered }: PhonicsCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSpeak = () => {
    speak(`${grapheme} makes the sound ${sound}. Like in ${example}.`);
  };

  const handleListen = () => {
    if (!SpeechRecognizer.isSupported()) {
      setFeedback("Speech recognition not available on this device");
      return;
    }
    setListening(true);
    const recognizer = new SpeechRecognizer();
    recognizer.start(
      (transcript) => {
        setListening(false);
        const match = transcript.toLowerCase().includes(example.toLowerCase());
        setFeedback(match ? "🌟 Excellent pronunciation!" : `Good try! The word is "${example}"`);
        if (match) setTimeout(() => onMastered?.(), 1800);
      },
      () => {
        setListening(false);
        setFeedback("Could not hear you. Try again!");
      },
    );
  };

  return (
    <motion.div
      className="perspective-1000 w-full max-w-sm mx-auto"
      whileHover={{ scale: 1.02 }}
    >
      <div
        className="relative cursor-pointer min-h-[320px]"
        onClick={() => setFlipped(!flipped)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setFlipped(!flipped)}
        aria-label={`Phonics card for ${grapheme}`}
      >
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: -90 }}
              className="rounded-3xl bg-gradient-to-br from-giga-orange to-giga-yellow p-8 text-white shadow-xl text-center"
            >
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">{type}</span>
              <div className="font-display my-6 text-7xl font-bold">{grapheme}</div>
              <p className="text-2xl font-bold">{sound}</p>
              <p className="mt-4 text-lg opacity-90">Tap to flip →</p>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: -90 }}
              className="rounded-3xl bg-gradient-to-br from-giga-purple to-giga-blue p-8 text-white shadow-xl text-center"
            >
              <p className="text-lg opacity-90">Example word:</p>
              <div className="font-display my-6 text-5xl font-bold">{example}</div>
              <div className="flex flex-col gap-3 mt-4">
                <Button variant="secondary" size="md" onClick={(e) => { e.stopPropagation(); handleSpeak(); }}>
                  <Volume2 className="h-5 w-5" /> Listen
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="border-white text-white hover:bg-white/10"
                  onClick={(e) => { e.stopPropagation(); handleListen(); }}
                  loading={listening}
                >
                  <Mic className="h-5 w-5" /> Say It
                </Button>
              </div>
              {feedback && (
                <p className={cn("mt-4 font-bold", feedback.includes("Excellent") ? "text-giga-yellow" : "")}>
                  {feedback}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface BlendingActivityProps {
  phonemes: string[];
  word: string;
  image: string;
  onComplete?: () => void;
}

export function BlendingActivity({ phonemes, word, image, onComplete }: BlendingActivityProps) {
  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const blend = () => {
    if (revealed < phonemes.length) {
      speak(phonemes[revealed]);
      setRevealed((r) => r + 1);
    } else if (!done) {
      speak(word);
      setDone(true);
      setAdvancing(true);
      setTimeout(() => onComplete?.(), 2000);
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">{image}</div>
      <div className="flex justify-center gap-3 flex-wrap">
        {phonemes.map((p, i) => (
          <motion.button
            key={i}
            className={cn(
              "font-display text-4xl font-bold w-16 h-16 rounded-2xl border-2 transition-all touch-target",
              i < revealed
                ? "bg-giga-purple text-white border-giga-purple"
                : "bg-white border-giga-border text-giga-muted dark:bg-giga-surface",
            )}
            onClick={() => i === revealed && blend()}
            animate={i < revealed ? { scale: [1, 1.2, 1] } : {}}
          >
            {p}
          </motion.button>
        ))}
      </div>
      {done && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-giga-green font-bold text-2xl">
            <CheckCircle className="h-8 w-8" />
            {word}!
          </div>
          {advancing && (
            <p className="text-sm text-giga-muted">Moving to next word...</p>
          )}
        </motion.div>
      )}
      {!done && (
        <Button size="lg" onClick={blend}>
          {revealed < phonemes.length ? "Blend Next Sound 🔊" : "Say the Word!"}
        </Button>
      )}
    </div>
  );
}
