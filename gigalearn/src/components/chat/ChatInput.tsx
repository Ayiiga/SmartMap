"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Plus, Send, Smile, X } from "lucide-react";
import { UPLOAD_OPTIONS, type UploadOption } from "@/lib/ai/giga3";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string, files?: File[]) => void;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

function UploadGrid({
  onPick,
  onTemplate,
  onClose,
}: {
  onPick: (opt: UploadOption, files: FileList | null) => void;
  onTemplate: () => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState<UploadOption | null>(null);

  function choose(opt: UploadOption) {
    if (opt.id === "action-research") {
      onTemplate();
      return;
    }
    setActive(opt);
    requestAnimationFrame(() => fileRef.current?.click());
  }

  return (
    <div
      className="giga3-upload-sheet absolute inset-x-0 bottom-[60px] z-30 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-3 shadow-lg"
      role="dialog"
      aria-label="Attach media or documents"
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#6B7280]">Attach</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
          aria-label="Close attachments"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {(["MEDIA", "DOCUMENTS"] as const).map((section) => (
        <div key={section} className="mb-2 last:mb-0">
          <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            {section === "MEDIA" ? "Media" : "Documents"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {UPLOAD_OPTIONS.filter((o) => o.section === section).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => choose(opt)}
                className="flex min-h-[76px] flex-col items-start justify-between rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-2 text-left transition-colors hover:border-[#EAB308]"
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {opt.icon}
                </span>
                <span className="mt-1 w-full">
                  <span className="block truncate text-[13px] font-bold text-black">{opt.title}</span>
                  <span className="block truncate text-[11px] text-[#6B7280]">{opt.subtitle}</span>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                      opt.location === "AI STUDIO" ? "bg-[#EAB308] text-black" : "bg-[#F3F4F6] text-[#374151]",
                    )}
                  >
                    {opt.location}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept={active?.accept ?? "*/*"}
        capture={active?.capture as unknown as undefined}
        multiple={active?.id === "photos"}
        onChange={(e) => {
          if (active) onPick(active, e.target.files);
          e.target.value = "";
        }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

function VoiceOverlay({ onCancel, onSend }: { onCancel: () => void; onSend: (text: string) => void }) {
  const recRef = useRef<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-GH";
    rec.interimResults = true;
    rec.continuous = false;
    // Noise suppression / echo cancellation apply to getUserMedia audio; speech
    // recognition runs on the same constrained pipeline where available.
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ");
      setTranscript(text);
    };
    rec.onerror = () => setSupported(false);
    try {
      rec.start();
    } catch {
      setSupported(false);
    }
    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  return (
    <div className="absolute inset-x-0 bottom-[60px] z-30 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-3 shadow-lg" role="dialog" aria-label="Voice note">
      <div className="flex items-center gap-2">
        <span className="giga3-waveform" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} style={{ animationDelay: `${i * 120}ms` }} />
          ))}
        </span>
        <p className="flex-1 text-[13px] font-semibold text-black">
          Listening… Twi/Hausa available
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-9 min-w-[44px] items-center justify-center rounded-full bg-[#F3F4F6] px-3 text-[13px] font-bold text-[#374151]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSend(transcript)}
          disabled={!transcript.trim()}
          className="flex h-9 min-w-[44px] items-center justify-center rounded-full bg-[#7C3AED] px-3 text-[13px] font-bold text-white disabled:opacity-40"
        >
          Send
        </button>
      </div>
      {!supported && (
        <p className="mt-2 text-[12px] text-[#6B7280]">
          Voice recognition isn&apos;t supported in this browser — type your message instead, or attach an audio file.
        </p>
      )}
      {transcript ? (
        <p className="mt-2 line-clamp-2 text-[13px] text-[#374151]">{transcript}</p>
      ) : (
        <p className="mt-2 text-[12px] text-[#9CA3AF]">Speak now — e.g. “Explain fractions for BECE”…</p>
      )}
    </div>
  );
}

export function ChatInput({ value, onChange, onSend, disabled, inputRef }: ChatInputProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [attached, setAttached] = useState<File[]>([]);
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef ?? localRef;

  function autoGrow() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 4 * 24;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }

  useEffect(() => {
    autoGrow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function submit() {
    const text = value.trim();
    if (!text && attached.length === 0) return;
    onSend(text, attached.length ? attached : undefined);
    setAttached([]);
    setUploadOpen(false);
    setVoiceOpen(false);
  }

  return (
    <div className="chat-keyboard-shell relative">
      {attached.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 px-1">
          {attached.map((f, i) => (
            <span key={`${f.name}-${i}`} className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12px] text-black">
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => setAttached((a) => a.filter((_, j) => j !== i))}
                className="text-[#6B7280]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      {uploadOpen && (
        <UploadGrid
          onClose={() => setUploadOpen(false)}
          onTemplate={() => {
            setUploadOpen(false);
            onChange(`${value}Research plan template: title, objectives, method, citations. `);
            ref.current?.focus();
          }}
          onPick={(_opt, files) => {
            if (files?.length) setAttached((a) => [...a, ...Array.from(files)]);
            setUploadOpen(false);
          }}
        />
      )}
      {voiceOpen && (
        <VoiceOverlay onCancel={() => setVoiceOpen(false)} onSend={(t) => t.trim() && onSend(t.trim())} />
      )}
      <div className="sticky bottom-[72px] z-20 m-3 flex items-center gap-2 rounded-[24px] border border-[#E5E7EB] bg-[#FFFFFF] p-2 shadow-sm">
        <button
          type="button"
          onClick={() => {
            setVoiceOpen(false);
            setUploadOpen((v) => !v);
          }}
          aria-label="Attach media or documents"
          aria-expanded={uploadOpen}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[20px] font-bold leading-none text-[#374151]"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setUploadOpen(false);
            setVoiceOpen((v) => !v);
          }}
          aria-label="Voice note"
          aria-expanded={voiceOpen}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            voiceOpen ? "bg-[#EAB308] text-black" : "bg-[#F3F4F6] text-[#374151]",
          )}
        >
          <Mic className="h-[18px] w-[18px]" />
        </button>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Message Giga3 AI..."
          aria-label="Message Giga3 AI"
          className="giga3-chat-input max-h-[96px] min-h-[36px] flex-1 resize-none bg-transparent text-[14px] leading-6 text-black placeholder-[#9CA3AF] outline-none"
        />
        <button
          type="button"
          aria-label="Insert emoji"
          onClick={() => onChange(`${value}😊`)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F3F4F6]"
        >
          <Smile className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={disabled || (!value.trim() && attached.length === 0)}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white transition-opacity disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
