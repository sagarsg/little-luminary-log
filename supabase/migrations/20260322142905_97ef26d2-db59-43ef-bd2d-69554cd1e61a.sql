-- Fix RLS policies to use authenticated role instead of public

-- milestones table
DROP POLICY IF EXISTS "Users can delete their own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can insert their own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can update their own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can view their own milestones" ON public.milestones;

CREATE POLICY "Users can delete their own milestones" ON public.milestones FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own milestones" ON public.milestones FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestones" ON public.milestones FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own milestones" ON public.milestones FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- milestone_media table
DROP POLICY IF EXISTS "Users can delete their own milestone media" ON public.milestone_media;
DROP POLICY IF EXISTS "Users can insert their own milestone media" ON public.milestone_media;
DROP POLICY IF EXISTS "Users can update their own milestone media" ON public.milestone_media;
DROP POLICY IF EXISTS "Users can view their own milestone media" ON public.milestone_media;

CREATE POLICY "Users can delete their own milestone media" ON public.milestone_media FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own milestone media" ON public.milestone_media FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestone media" ON public.milestone_media FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own milestone media" ON public.milestone_media FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- babies table
DROP POLICY IF EXISTS "Users can delete their own babies" ON public.babies;
DROP POLICY IF EXISTS "Users can insert their own babies" ON public.babies;
DROP POLICY IF EXISTS "Users can update their own babies" ON public.babies;
DROP POLICY IF EXISTS "Users can view their own babies" ON public.babies;

CREATE POLICY "Users can delete their own babies" ON public.babies FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own babies" ON public.babies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own babies" ON public.babies FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own babies" ON public.babies FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- entries table
DROP POLICY IF EXISTS "Users can delete their own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can insert their own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can view their own entries" ON public.entries;

CREATE POLICY "Users can delete their own entries" ON public.entries FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own entries" ON public.entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries" ON public.entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own entries" ON public.entries FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);