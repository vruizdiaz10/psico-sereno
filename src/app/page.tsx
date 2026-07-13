"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { isCrisisResponse, linkifyPhones } from "@/lib/crisis";

const INTRO_SEEN_KEY = "sereno_intro_seen";

function EnsoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`enso-mark ${className}`} aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="35 5"
        strokeDashoffset="7"
        transform="rotate(-100 8 8)"
      />
    </svg>
  );
}

function CrisisMessage({ text }: { text: string }) {
  return (
    <div className="flex gap-3 max-w-[92%]">
      <EnsoMark className="mt-2 size-4 shrink-0 text-crisis" />
      <div className="rounded-xl border border-crisis/40 bg-crisis-surface px-4 py-3 text-body leading-relaxed text-text-primary whitespace-pre-wrap">
        {linkifyPhones(text.replace(/\*\*/g, "")).map((part, i) =>
          typeof part === "string" ? (
            <span key={i}>{part}</span>
          ) : (
            <a
              key={i}
              href={`tel:${part.digits}`}
              className="font-medium underline decoration-crisis underline-offset-2"
            >
              {part.phone}
            </a>
          ),
        )}
      </div>
    </div>
  );
}

function IntroBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mb-4 rounded-xl border border-border/30 bg-bg-surface px-4 py-3.5">
      <p className="font-display text-body leading-relaxed text-text-primary">
        Sereno no es un chat cualquiera: sus mensajes no llevan burbuja, solo
        este círculo — así sabrás que es él. Y recuerda lo que hablan, así
        que puedes continuar donde lo dejaste.
      </p>
      <button
        onClick={onDismiss}
        className="mt-2 text-xs text-text-muted underline underline-offset-2"
      >
        Entendido
      </button>
    </div>
  );
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [showIntro, setShowIntro] = useState(false);
  const { messages, sendMessage, status, error, clearError } = useChat();
  const isBusy = status === "submitted" || status === "streaming";
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reads an external system (localStorage) once on mount; default false avoids SSR/hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowIntro(!localStorage.getItem(INTRO_SEEN_KEY));
  }, []);

  const dismissIntro = () => {
    localStorage.setItem(INTRO_SEEN_KEY, "1");
    setShowIntro(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isBusy]);

  const lastAssistantText =
    !isBusy && messages.length > 0
      ? messages
          .filter((m) => m.role === "assistant")
          .at(-1)
          ?.parts.filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("")
      : "";

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto w-full bg-bg">
      <header className="shrink-0 border-b border-border/20 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <EnsoMark className="size-5 text-accent-strong" />
          <h1 className="font-display text-2xl text-text-primary tracking-tight">
            Sereno
          </h1>
        </div>
        <p className="mt-1.5 text-sm text-text-muted leading-relaxed">
          Acompañamiento conversacional. No sustituye terapia clínica ni
          atención de emergencia.
        </p>
      </header>

      <main
        role="log"
        aria-live="off"
        className="flex-1 overflow-y-auto px-5 py-8 space-y-8"
      >
        {showIntro && <IntroBanner onDismiss={dismissIntro} />}

        {messages.length === 0 && (
          <p className="font-display text-lg text-text-muted text-center mt-16">
            Escribe cómo estás. Sereno está para escucharte.
          </p>
        )}

        {messages.map((message) => {
          const text = message.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("");
          if (!text) return null;

          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[82%] rounded-2xl bg-bg-surface px-4 py-2.5 text-body leading-relaxed text-text-primary whitespace-pre-wrap">
                  <span className="sr-only">Tú: </span>
                  {text}
                </div>
              </div>
            );
          }

          if (isCrisisResponse(text)) {
            return <CrisisMessage key={message.id} text={text} />;
          }

          return (
            <div key={message.id} className="flex gap-3 max-w-[90%]">
              <EnsoMark className="mt-2 size-4 shrink-0 text-accent" />
              <p className="border-l border-border/30 pl-3.5 text-body leading-relaxed text-text-primary whitespace-pre-wrap">
                <span className="sr-only">Sereno: </span>
                {text}
              </p>
            </div>
          );
        })}

        {isBusy && (
          <div className="flex items-center gap-3">
            <EnsoMark className="size-4 shrink-0 text-accent" />
            <span className="text-sm text-text-muted">un momento…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-crisis/40 bg-crisis-surface px-4 py-3 text-sm text-text-primary">
            Algo no salió bien de este lado. Tu mensaje no se perdió, solo
            intenta de nuevo.
            <button
              onClick={() => clearError()}
              className="ml-2 underline underline-offset-2"
            >
              Reintentar
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <div aria-live="polite" className="sr-only">
        {lastAssistantText}
      </div>

      <form
        className="shrink-0 border-t border-border/20 p-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || isBusy) return;
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Escribe tu mensaje
        </label>
        <input
          id="chat-input"
          className="flex-1 rounded-full border border-border/40 bg-bg-surface px-4 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-strong/60 aria-disabled:opacity-60"
          value={input}
          placeholder="¿Qué traes hoy?"
          onChange={(e) => setInput(e.currentTarget.value)}
          aria-disabled={isBusy}
          readOnly={isBusy}
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          aria-label="Enviar"
          className="flex items-center justify-center size-11 shrink-0 rounded-full bg-accent-strong text-bg transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-30 disabled:hover:opacity-100"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 8h11.5M8.5 2.5L14 8l-5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
