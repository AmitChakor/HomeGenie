/**
 * What this does:
 * Supabase Edge Function that creates an appointment from AI-parsed data.
 * Called by the chat function when Claude uses the book_appointment tool.
 * Accepts { user_id, title, vendor_id?, start_time, end_time?, location?,
 *           reminder_minutes?, description? }
 * Returns the created appointment row.
 *
 * Deploy: supabase functions deploy book-appointment --no-verify-jwt
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        title: body.title,
        vendor_id: body.vendor_id ?? null,
        start_time: body.start_time,
        end_time: body.end_time ?? null,
        location: body.location ?? null,
        reminder_minutes: body.reminder_minutes ?? 30,
        description: body.description ?? null,
        status: 'upcoming',
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ appointment: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Book appointment error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
