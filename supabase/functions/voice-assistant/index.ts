import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES_INFO = `
Available baby tracking categories and what details are needed:

TIMER categories (need duration or start/stop):
- sleep: Duration or start time. Ask: "How long did the baby sleep?" or "When did the nap start?"
- pump: Amount in ml/oz. Ask: "How much was pumped?"
- bath: Duration optional. Can log without details.
- tummy: Duration optional. Can log without details.
- story: Duration optional. Can log without details.
- screen: Duration optional. Can log without details.
- skincare: Duration optional. Can log without details.
- play: Duration optional. Can log without details.

DETAIL categories (need specific info):
- feed: Type (bottle/nursing/solids), amount (oz/ml), side (left/right/both for nursing). Ask: "Was it bottle or nursing?" and "How much?"
- diaper: Type (wet/dirty/mixed/dry). Ask: "Was it wet, dirty, or mixed?"
- temp: Temperature value and unit. Ask: "What was the temperature?"
- growth: What was measured (weight/height/head), value and unit. Ask: "What measurement and value?"
- meds: Medicine name and dosage. Ask: "What medicine and how much?"

SIMPLE categories (can log with minimal info):
- notes: Just needs the note text.
- brush: Teeth brushing, no extra details needed.
`;

const MONTH_PATTERN = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/i;

const pad2 = (value: number) => String(value).padStart(2, "0");

function mentionsExplicitDate(transcript: string) {
  return (
    /\b(today|tomorrow|yesterday|last\s+\w+|next\s+\w+)\b/i.test(transcript) ||
    /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/.test(transcript) ||
    /\b\d{4}-\d{2}-\d{2}\b/.test(transcript) ||
    MONTH_PATTERN.test(transcript)
  );
}

function extractTimeParts(transcript: string) {
  const meridiemMatch = transcript.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (meridiemMatch) {
    let hours = Number(meridiemMatch[1]);
    const minutes = Number(meridiemMatch[2] || "0");
    const meridiem = meridiemMatch[3].toLowerCase();

    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;

    return { hours, minutes };
  }

  const twentyFourHourMatch = transcript.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFourHourMatch) {
    return {
      hours: Number(twentyFourHourMatch[1]),
      minutes: Number(twentyFourHourMatch[2]),
    };
  }

  return null;
}

function buildLocalTimestamp(localDate: string, utcOffset: string, hours: number, minutes: number) {
  return `${localDate}T${pad2(hours)}:${pad2(minutes)}:00${utcOffset}`;
}

function normalizeLoggedAt(
  loggedAt: unknown,
  transcript: string,
  localDate?: string,
  utcOffset?: string,
) {
  if (localDate && utcOffset && !mentionsExplicitDate(transcript)) {
    const time = extractTimeParts(transcript);
    if (time) {
      return buildLocalTimestamp(localDate, utcOffset, time.hours, time.minutes);
    }
  }

  return typeof loggedAt === "string" && loggedAt.trim() ? loggedAt : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { transcript, conversationHistory, localDate, utcOffset, timeZone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a baby tracking voice assistant. You help parents log baby activities quickly via voice.

${CATEGORIES_INFO}

Current user context:
- User timezone: ${timeZone || "unknown"}
- Today's local date: ${localDate || "unknown"}
- UTC offset: ${utcOffset || "unknown"}

Your job:
1. Parse what the user said and identify the category and details.
2. If critical details are missing, ask for only the missing detail in a brief conversational way.
3. If the user only gives one missing detail, combine it with the earlier context.
4. Once you have enough info, confirm the exact entry before it is logged.
5. If the user says "quantity unknown" or "not sure" for optional fields, skip that detail.
6. If the user says "cancel", "cancel entry", or "never mind", cancel the entry.

IMPORTANT RULES:
- Be concise. Keep responses under 15 words when possible.
- Never replace a user-specified time with the current time.
- If the user gave a time but not a date, treat it as today in the user's local timezone.
- If the user gave quantity but no time, ask for time.
- If the user gave time but no required quantity, ask for quantity.
- For simple categories (bath, tummy, story, screen, skincare, play, brush), you can confirm immediately without asking for details.
- Always respond in a natural, spoken way (this will be read aloud via TTS).

Respond with JSON only. Format:
{
  "action": "ask" | "confirm" | "log" | "cancel",
  "message": "What you want to say to the user",
  "entry": {
    "categoryId": "the category id",
    "detail": "human-readable detail string",
    "durationSeconds": null or number,
    "loggedAt": null or ISO timestamp
  }
}

- "ask": You need more info. entry can be partial.
- "confirm": You have enough info and are asking the user to confirm. entry must be complete.
- "log": User confirmed. entry must be complete.
- "cancel": User wants to cancel. entry is null.

When action is "ask" or before confirmation, entry.detail should reflect what you know so far.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: transcript },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        action: "ask",
        message: "Sorry, I didn't catch that. Could you say it again?",
        entry: null,
      };
    }

    if (parsed?.entry) {
      parsed.entry.loggedAt = normalizeLoggedAt(parsed.entry.loggedAt, transcript, localDate, utcOffset);
    }

    if (parsed?.action === "cancel") {
      parsed.entry = null;
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Voice assistant error:", error);
    return new Response(
      JSON.stringify({
        action: "ask",
        message: "Something went wrong. Please try again.",
        entry: null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
