// ponytail: keyword match on the exact hotline text our own system prompt injects —
// reliable because we control that phrasing, not a general sentiment classifier.
const CRISIS_MARKERS = ["911-2000", "saptel"];

export function isCrisisResponse(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_MARKERS.some((marker) => lower.includes(marker));
}

// Groq sometimes emits non-breaking hyphen (U+2011) or en-dash (U+2013) instead of ASCII "-".
const SEP = "[\\s.\\-\\u2011\\u2013]?";
const PHONE_PATTERN = new RegExp(
  `(\\d{3}${SEP}\\d{3}${SEP}\\d{4}|\\d{2}${SEP}\\d{4}${SEP}\\d{4})`,
  "g",
);

export function linkifyPhones(text: string): (string | { phone: string; digits: string })[] {
  const parts: (string | { phone: string; digits: string })[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(PHONE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push({ phone: match[0], digits: match[0].replace(/\D/g, "") });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
