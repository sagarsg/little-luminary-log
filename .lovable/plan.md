

# Milestones Diary Feature

## Overview
Transform the static milestones list into a full diary/journal system where parents can log both preset developmental milestones and custom life moments (first trip, first visitor, etc.), attach photos/videos, and browse them chronologically.

## Database Changes

**New table: `milestones`**
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL, references auth.users)
- `baby_id` (uuid, nullable, references babies)
- `title` (text, NOT NULL) -- "First Smile" or custom like "First International Trip"
- `description` (text, nullable) -- diary-style notes
- `milestone_date` (timestamptz, NOT NULL, default now())
- `is_preset` (boolean, default false) -- distinguishes preset vs custom
- `preset_age_range` (text, nullable) -- "6-8 weeks" for presets
- `created_at` / `updated_at` (timestamptz)
- RLS: standard user_id-based CRUD policies

**Storage bucket: `milestone-media`**
- Public bucket for milestone photos/videos
- RLS policies scoped to authenticated users on their own files

**New table: `milestone_media`**
- `id` (uuid, PK)
- `milestone_id` (uuid, references milestones, ON DELETE CASCADE)
- `user_id` (uuid, NOT NULL)
- `file_url` (text, NOT NULL)
- `file_type` (text) -- "image" or "video"
- `created_at` (timestamptz)
- RLS: user_id-based CRUD

## UI Changes

### 1. Revamp ChildProfile Milestones Section
- Keep the preset milestones list but make them tappable to "complete" (sets date, opens detail modal)
- Add a prominent "+ Add Milestone" button at the top for custom entries
- Show completed milestones with date and thumbnail if media attached

### 2. Add/Edit Milestone Modal
- Title field (pre-filled for presets, free text for custom)
- Description textarea (diary entry)
- Date/time picker (defaults to now)
- Media upload area (multiple images/videos via file input)
- Save / Cancel buttons

### 3. Edit Existing Milestone
- Tap any completed milestone card to open the same modal in edit mode
- Can update title, description, date, and add/remove media

### 4. Chronological Timeline View
- New "Timeline" tab or section on the ChildProfile page
- Scrollable vertical timeline showing all milestones in date order
- Each card shows: date, title, description snippet, media thumbnails
- Tap to expand full detail with all photos/videos

## Files to Create/Edit
- **Migration SQL**: Create `milestones` table, `milestone_media` table, `milestone-media` storage bucket + RLS
- **`src/components/MilestoneModal.tsx`** (new): Add/edit form with media upload
- **`src/components/MilestoneTimeline.tsx`** (new): Chronological diary view
- **`src/components/MilestoneCard.tsx`** (new): Individual milestone display card
- **`src/pages/ChildProfile.tsx`**: Wire up real data, add custom milestone button, integrate timeline view
- **`src/hooks/useMilestones.ts`** (new): CRUD operations for milestones + media upload

