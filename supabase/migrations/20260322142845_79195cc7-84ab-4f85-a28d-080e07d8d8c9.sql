DROP POLICY IF EXISTS "Users can delete their own milestone media files" ON storage.objects;

CREATE POLICY "Users can view own milestone media files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'milestone-media'
    AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload to their own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'milestone-media'
    AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own milestone media files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'milestone-media'
    AND (storage.foldername(name))[1] = auth.uid()::text);