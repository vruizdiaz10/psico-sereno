"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const isBusy = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-zinc-50 dark:bg-black">
      <header className="shrink-0 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Sereno
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Acompañamiento conversacional. No sustituye terapia clínica ni
          atención de emergencia.
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center mt-8">
            Escribe cómo estás. Sereno está para escucharte.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                  : "bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:border-zinc-800"
              }`}
            >
              {message.parts.map((part, i) =>
                part.type === "text" ? (
                  <span key={`${message.id}-${i}`}>{part.text}</span>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </main>

      <form
        className="shrink-0 border-t border-zinc-200 dark:border-zinc-800 p-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || isBusy) return;
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          value={input}
          placeholder="Escribe algo..."
          onChange={(e) => setInput(e.currentTarget.value)}
          disabled={isBusy}
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          className="rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
