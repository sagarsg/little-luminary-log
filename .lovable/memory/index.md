# Baby Tracker App - Design & Architecture Notes

## Design System
- Palette: Warm cream background (35 30% 96%), sage green primary (152 30% 42%), earth-tone accents
- Font: DM Sans
- Category colors: sleep=periwinkle, feed=warm coral, diaper=teal, temp=rose, growth=lavender, meds=gold, pump=sky, notes=sage
- Activity colors: bath=cyan, tummy=amber, story=purple, screen=blue, skincare=pink, play=green, brush=teal, custom=brown
- Style: Organic wellness aesthetic, rounded-2xl cards, soft shadows, mobile-first max-w-md

## Architecture
- Timer-based categories: sleep, pump, bath, tummy, story, screen, skincare, play
- Modal categories: feed (nursing/bottle/solids), diaper (pee/poo/mixed/dry)
- Instant-log categories: temp, growth, meds, notes, brush, custom
- Feed subtypes: Nursing (left/right/both + timer), Bottle (breast milk/formula/other + oz), Solids (popular foods + custom + amount)
- Backend: Lovable Cloud (Supabase) — profiles, babies, entries, notification_preferences tables with RLS
- Auth: Email/password + Google + Apple (managed by Lovable Cloud)
- PWA: vite-plugin-pwa configured, installable from browser
- Capacitor: configured for future native iOS/Android builds

## Voice Assistant
- Conversational AI voice assistant in center nav button
- Uses Lovable AI (gemini-3-flash-preview) via voice-assistant edge function
- Flow: user speaks → 1.5s silence detection → AI parses & asks follow-ups → TTS response → confirms before logging
- Asks for missing details (quantity, type, time) before confirming
- Uses Web Speech API (STT) + SpeechSynthesis (TTS)
- SmartLogFAB no longer has voice option (moved to center nav)
- VoiceCommand.tsx removed — all voice logic in useVoiceConversation hook

## Bottom Nav
- Center button = Voice/Mic (conversational AI assistant)
- Right side = + button for SmartLogFAB (text log, quick actions, photo)

## Notifications
- Weekly/monthly push notifications (user configurable in Settings)
- Weekly/monthly email summaries (default: monthly)
- Cron jobs: weekly Monday 9am, monthly 1st day 9am
- Edge function: send-summary (generates stats from entries table)

## User Preferences
- App name: TBD (user will decide later)
- V1 focus: Baby tracker dashboard
- Design: Wellness + soft organic hybrid
- Mobile strategy: PWA now, native (Capacitor) later
- **DO NOT copy Huckleberry** - must differentiate in design and UX
