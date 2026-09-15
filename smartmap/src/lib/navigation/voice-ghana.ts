export type VoiceLanguage = "en" | "tw";

const TWI_DIRECTION: Record<string, string> = {
  north: "kɔkɔɔ fam",
  south: "kusiw fam",
  east: "apuei fam",
  west: "atɔe fam",
  left: "benkum",
  right: "nifa",
  straight: "kɔ so",
};

const TWI_PHRASES: Record<string, string> = {
  "Continue for": "Kɔ so ma",
  "Turn left": "San kɔ benkum",
  "Turn right": "San kɔ nifa",
  "Head north": "Kɔ kɔkɔɔ fam",
  "Head south": "Kɔ kusiw fam",
  "Head east": "Kɔ apuei fam",
  "Head west": "Kɔ atɔe fam",
  "Arrive at": "Kɔ dur",
  "Depart from": "Fi ase fi",
};

export function translateStepToTwi(step: string): string {
  let out = step;
  for (const [en, tw] of Object.entries(TWI_PHRASES)) {
    if (out.startsWith(en)) {
      out = out.replace(en, tw);
      break;
    }
  }
  for (const [dir, tw] of Object.entries(TWI_DIRECTION)) {
    out = out.replace(new RegExp(`\\b${dir}\\b`, "i"), tw);
  }
  return out;
}

export function localizeVoiceStep(step: string, language: VoiceLanguage): string {
  if (language === "tw") return translateStepToTwi(step);
  return step;
}

export function voiceLanguageLabel(language: VoiceLanguage): string {
  return language === "tw" ? "Twi" : "English";
}

export function pickSpeechVoice(language: VoiceLanguage): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (language === "tw") {
    return (
      voices.find((v) => /twi|akan|gh|en-gh/i.test(v.lang + v.name)) ??
      voices.find((v) => v.lang.startsWith("en")) ??
      null
    );
  }
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

export function speakLocalized(text: string, language: VoiceLanguage): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    const voice = pickSpeechVoice(language);
    if (voice) utter.voice = voice;
    utter.lang = language === "tw" ? "en-GH" : "en-US";
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}
