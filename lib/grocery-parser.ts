/**
 * What this does:
 * Client for the parse-grocery edge function.
 * Takes freeform text (from voice or typed input) and returns
 * structured grocery items parsed by Claude.
 */

import { supabase } from './supabase';

export interface ParsedGroceryItem {
  name: string;
  quantity: number;
  unit: string | null;
  notes: string | null;
}

export async function parseGroceryText(
  text: string
): Promise<ParsedGroceryItem[]> {
  if (!text.trim()) return [];

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const response = await fetch(`${supabaseUrl}/functions/v1/parse-grocery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grocery parsing failed: ${errorText}`);
  }

  const data = await response.json();
  return data.items ?? [];
}
