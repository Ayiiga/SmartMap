"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/speech";

interface FlashcardProps {
  word: string;
  meaning: string;
  image?: string;
  synonym?: string;
  antonym?: string;
}

export function FlashcardDeck({
  cards,
  onComplete,
}: {
  cards: FlashcardProps[];
  onComplete?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);

  const card = cards[index];
  if (!card) return null;

  const next = () => {
    setFlipped(false);
    if (index >= cards.length - 1) {
      if (!finished) {
        setFinished(true);
        onComplete?.();
      }
      return;
    }
    setIndex((i) => i + 1);
  };

  const prev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex justify-between text-sm text-giga-muted">
        <span>Card {index + 1} of {cards.length}</span>
      </div>

      <motion.div
        className="relative min-h-[280px] cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${index}-${flipped}`}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            className="rounded-3xl bg-gradient-to-br from-giga-green to-giga-teal p-8 text-white shadow-xl text-center min-h-[280px] flex flex-col items-center justify-center"
          >
            {!flipped ? (
              <>
                {card.image && <span className="text-6xl mb-4">{card.image}</span>}
                <h3 className="font-display text-4xl font-bold">{card.word}</h3>
                <p className="mt-4 opacity-80">Tap to see meaning</p>
              </>
            ) : (
              <>
                <p className="text-xl font-medium">{card.meaning}</p>
                {card.synonym && <p className="mt-3 text-sm opacity-90">Similar: {card.synonym}</p>}
                {card.antonym && <p className="mt-1 text-sm opacity-90">Opposite: {card.antonym}</p>}
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={(e) => { e.stopPropagation(); speak(`${card.word}. ${card.meaning}`); }}
                >
                  <Volume2 className="h-4 w-4" /> Hear
                </Button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="flex justify-between gap-4">
        <Button variant="outline" size="md" onClick={prev} aria-label="Previous card">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="md" onClick={next} aria-label="Next card">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
