import { groq } from "@ai-sdk/groq";
import {
  streamText,
  type UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";
import { after } from "next/server";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { PRIMARY_MODEL } from "@/lib/models";
import {
  getOrCreateUserId,
  getRecentSummaries,
  shouldSummarize,
  summarizeAndStore,
} from "@/lib/memory";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const userId = await getOrCreateUserId();
  const summaries = await getRecentSummaries(userId);
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: groq(PRIMARY_MODEL),
    system: buildSystemPrompt(summaries),
    messages: modelMessages,
    onFinish: ({ text }) => {
      const fullTranscript = [
        ...modelMessages,
        { role: "assistant" as const, content: text },
      ];
      if (shouldSummarize(fullTranscript.length)) {
        after(() => summarizeAndStore(userId, fullTranscript));
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
