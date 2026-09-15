"use client";

export function speak(text: string, lang = "en-US", rate = 0.9): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export class SpeechRecognizer {
  private recognition: SpeechRecognition | null = null;
  private onResult?: (transcript: string) => void;
  private onError?: (error: string) => void;

  constructor() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = "en-US";
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      this.onResult?.(transcript);
    };

    this.recognition.onerror = (event) => {
      this.onError?.(event.error);
    };
  }

  start(onResult: (transcript: string) => void, onError?: (error: string) => void): void {
    if (!this.recognition) {
      onError?.("Speech recognition not supported");
      return;
    }
    this.onResult = onResult;
    this.onError = onError;
    this.recognition.start();
  }

  stop(): void {
    this.recognition?.stop();
  }

  static isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  }
}
