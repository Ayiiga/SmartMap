"use client";

import { VOCABULARY_CATEGORIES, SIGHT_WORDS } from "@/content/curriculum";
import { FlashcardDeck } from "@/components/learning/flashcard";
import { Card, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function VocabularyPage() {
  const [category, setCategory] = useState(VOCABULARY_CATEGORIES[0].id);
  const selected = VOCABULARY_CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-bold">Vocabulary Builder</h1>
      <p className="mt-2 text-giga-muted">Flashcards, sight words, synonyms, and word categories</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {VOCABULARY_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-xl px-4 py-2 font-bold min-h-[44px] ${
              category === c.id ? "bg-giga-green text-white" : "bg-giga-green/10 text-giga-green"
            }`}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <FlashcardDeck
          cards={selected.words.map((w) => ({
            word: w.word,
            meaning: w.meaning,
            image: w.image,
            synonym: "synonym" in w ? w.synonym : undefined,
            antonym: "antonym" in w ? w.antonym : undefined,
          }))}
        />
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold mb-6">Sight Words</h2>
        <div className="flex flex-wrap gap-3">
          {SIGHT_WORDS.map((word) => (
            <Card key={word} className="px-4 py-2 min-w-[80px] text-center">
              <CardTitle className="text-lg">{word}</CardTitle>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
