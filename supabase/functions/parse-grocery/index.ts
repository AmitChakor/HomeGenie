/**
 * What this does:
 * Supabase Edge Function that parses freeform grocery text (from voice
 * transcription) into structured items using Claude with JSON output.
 * Input:  { text: "2kg atta, 1L milk, dozen eggs, some onions" }
 * Output: { items: [{ name: "Atta", quantity: 2, unit: "kg" }, ...] }
 *
 * Deploy: supabase functions deploy parse-grocery --no-verify-jwt
 */

import { corsHeaders } from '../_shared/cors.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';

const SYSTEM_PROMPT = `You are a grocery list parser. Given freeform text (often from voice input),
extract each grocery item into a structured JSON array.

Rules:
- Return ONLY valid JSON with the shape: { "items": [...] }
- Each item has: "name" (string, capitalized), "quantity" (number, default 1), "unit" (string or null), "notes" (string or null)
- Normalize common units: kg, g, L, mL, dozen, pcs (pieces), pack, bunch, bottle, can
- "dozen eggs" → { "name": "Eggs", "quantity": 12, "unit": "pcs" }
- "some onions" or "onions" → { "name": "Onions", "quantity": 1, "unit": "kg" }
- "half kg sugar" → { "name": "Sugar", "quantity": 0.5, "unit": "kg" }
- Handle Hindi/Hinglish: "do kilo aloo" → { "name": "Aloo (Potato)", "quantity": 2, "unit": "kg" }
- If quantity is ambiguous, make a reasonable assumption
- Remove duplicates by merging quantities
- Sort by category: produce, dairy, grains, spices, beverages, household, other`;

interface ParsedItem {
  name: string;
  quantity: number;
  unit: string | null;
  notes: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const { text } = (await req.json()) as { text: string };

    if (!text?.trim()) {
      return new Response(
        JSON.stringify({ items: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20241022',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Parse this grocery list:\n\n"${text}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Anthropic API error:', response.status, errorBody);
      return new Response(
        JSON.stringify({ error: 'AI parsing failed', detail: errorBody }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const content = result.content?.[0]?.text ?? '{"items":[]}';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ items: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as { items: ParsedItem[] };

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Parse grocery error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
