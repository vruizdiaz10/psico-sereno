import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { generateText, type ModelMessage } from "ai";
import { groq } from "@ai-sdk/groq";
import { db } from "./db";
import { users, sessionSummaries } from "./schema";
import { SUMMARY_MODEL } from "./models";

const COOKIE_NAME = "sereno_uid";
// ponytail: fixed cadence, not configurable — revisit if beta feedback wants tighter/looser memory.
const SUMMARIZE_EVERY_N_MESSAGES = 6;

export async function getOrCreateUserId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = randomUUID();
  store.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  db.insert(users).values({ id }).onConflictDoNothing().run();
  return id;
}

export async function getRecentSummaries(
  userId: string,
  limit = 5,
): Promise<string[]> {
  const rows = await db
    .select({ summary: sessionSummaries.summary })
    .from(sessionSummaries)
    .where(eq(sessionSummaries.userId, userId))
    .orderBy(desc(sessionSummaries.createdAt))
    .limit(limit);
  return rows.map((r) => r.summary).reverse();
}

export function shouldSummarize(messageCountAfterTurn: number): boolean {
  return messageCountAfterTurn % SUMMARIZE_EVERY_N_MESSAGES === 0;
}

export async function summarizeAndStore(
  userId: string,
  transcript: ModelMessage[],
): Promise<void> {
  const conversation = transcript
    .map((m) => `${m.role === "user" ? "Usuario" : "Sereno"}: ${typeof m.content === "string" ? m.content : JSON.stringify(m.content)}`)
    .join("\n");

  const { text } = await generateText({
    model: groq(SUMMARY_MODEL),
    system:
      "Resume esta conversación entre un usuario y Sereno (acompañante conversacional) en 2-3 " +
      "frases en español mexicano. Enfócate en: estado de ánimo, temas tratados, y cualquier " +
      "patrón notable. Sé concreto, sin relleno. No uses viñetas.",
    prompt: conversation,
  });

  db.insert(sessionSummaries).values({ userId, summary: text }).run();
}
