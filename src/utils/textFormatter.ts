/**
 * Clean & format noisy OCR output and speech transcripts
 */

export function sanitizeOcrText(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText
    // Remove typical browser screenshot UI artifacts
    .replace(/(?:Ask Gemini|web\.whatsapp\.com|sharing your screen|Stop sharing|Hide)/gi, '')
    // Remove isolated special symbols and separator bars
    .replace(/[|®©@_~`^{}\[\]<>]/g, ' ')
    // Replace multiple consecutive tabs/spaces with single space
    .replace(/[ \t]+/g, ' ')
    // Remove lines that are just numbers or single characters
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 2 && !/^[0-9\W]+$/.test(line))
    .join('\n');

  return cleaned.trim();
}

export function deduplicateRepeatedPhrases(text: string): string {
  if (!text) return '';

  // Remove immediate consecutive duplicate words/phrases
  const words = text.trim().split(/\s+/);
  const result: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // Check if the current 1-3 words match the previous 1-3 words
    if (result.length > 0 && result[result.length - 1].toLowerCase() === word.toLowerCase()) {
      continue;
    }
    result.push(word);
  }

  let cleaned = result.join(' ');

  // Fix repeated sub-phrases like "hello myself Balaji hello myself Balaji"
  const phraseRegex = /(\b.+?\b)(?:\s+\1)+/gi;
  cleaned = cleaned.replace(phraseRegex, '$1');

  return cleaned.trim();
}

export function formatCivicReport(rawObservation: string): string {
  const cleaned = deduplicateRepeatedPhrases(sanitizeOcrText(rawObservation));

  if (!cleaned) return '';

  // Format into structured civic observation format
  const lines = cleaned.split('\n').filter(Boolean);
  if (lines.length <= 1) {
    return cleaned;
  }

  return `• Incident Summary: ${lines[0]}
• Observed Evidence: ${lines.slice(1).join(' ')}
• Municipal Urgency: High Priority SLA Verification Required`;
}
