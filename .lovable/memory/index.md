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
- Backend: Lovable Cloud (Supabase) — profiles, babies, entries tables with RLS
- Auth: Email/password + Google + Apple (managed by Lovable Cloud)
- PWA: vite-plugin-pwa configured, installable from browser
- Capacitor: configured for future native iOS/Android builds

## Bottom Nav
- Center button = Voice/Mic (primary action, always visible)
- Right side = + / AI button for SmartLogFAB (text log, quick actions, photo)
- Voice mic: tap to listen, handles commands like "start sleep", "log diaper", "stop timer"

## User Preferences
- App name: TBD (user will decide later)
- V1 focus: Baby tracker dashboard
- Design: Wellness + soft organic hybrid
- Mobile strategy: PWA now, native (Capacitor) later
- No voice command feature (removed the old one)
- Smart Log FAB stays on right side
- Center nav = mic/voice button
- **DO NOT copy Huckleberry** - must differentiate in design and UX
- Don't copy Huckleberry - improve on it

## Notifications & Summaries
- Weekly/monthly summary push notifications (user configurable)
- Monthly email summary (default)
- Charts: growth percentile curves, weight tracking, sleep/feed pattern heatmaps
