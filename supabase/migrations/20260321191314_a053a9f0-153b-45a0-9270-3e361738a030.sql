
-- Milestones table
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  baby_id uuid REFERENCES public.babies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  milestone_date timestamptz NOT NULL DEFAULT now(),
  is_preset boolean NOT NULL DEFAULT false,
  preset_age_range text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milestones" ON public.milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own milestones" ON public.milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestones" ON public.milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own milestones" ON public.milestones FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Milestone media table
CREATE TABLE public.milestone_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'image',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.milestone_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milestone media" ON public.milestone_media FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own milestone media" ON public.milestone_media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestone media" ON public.milestone_media FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own milestone media" ON public.milestone_media FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for milestone media
INSERT INTO storage.buckets (id, name, public) VALUES ('milestone-media', 'milestone-media', true);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload milestone media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'milestone-media');
CREATE POLICY "Anyone can view milestone media" ON storage.objects FOR SELECT USING (bucket_id = 'milestone-media');
CREATE POLICY "Users can update their own milestone media files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'milestone-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete their own milestone media files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'milestone-media' AND (storage.foldername(name))[1] = auth.uid()::text);
