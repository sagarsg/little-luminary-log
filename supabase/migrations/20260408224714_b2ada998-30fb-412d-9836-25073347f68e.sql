-- Make the milestone-media bucket private
UPDATE storage.buckets SET public = false WHERE id = 'milestone-media';

-- Drop legacy overly permissive policies
DROP POLICY IF EXISTS "Anyone can view milestone media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload milestone media" ON storage.objects;
