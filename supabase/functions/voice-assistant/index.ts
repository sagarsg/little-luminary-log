import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a baby tracking voice assistant. You help parents log baby activities quickly via voice.

${CATEGORIES_INFO}

Your job:
1. Parse what the user said and identify the category and details.
2. If critical details are missing, ask for them conversationally. Be brief and warm.
3. When you have enough info, confirm what you're about to log and ask the user to say "yes" or confirm.
4. If the user says "quantity unknown" or "not sure" for optional fields, skip that detail.
5. If the user says "cancel" or "never mind", cancel the entry.

IMPORTANT RULES:
- Be concise. Keep responses under 15 words when possible.
- For time: if not specified, assume "just now" (current time). Don't ask for time unless the user partially mentioned it.
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
- "log": User confirmed. entry must be complete. message should be brief like "Got it!" or "Logged!"
- "cancel": User wants to cancel. entry is null. message should acknowledge cancellation.

When action is "ask" or before confirmation, entry.detail should reflect what you know so far.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: transcript },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.3,
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
        status: 200, // Return 200 so the client can handle it gracefully
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
