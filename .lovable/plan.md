

# Fix Warn-Level Security Issues

Three warn-level findings to address:

## 1. Storage Bucket: Baby Photos Publicly Readable

**Problem**: `milestone-media` bucket is public, and INSERT policy lacks path-scoping. Anyone can view all uploaded media without auth, and any authenticated user can upload to any path.

**Fix**:
- Migration to make the bucket private and replace storage policies with path-scoped ones (user ID as first folder segment)
- Update `useMilestones.ts`: replace `getPublicUrl()` with `createSignedUrl()` (1-hour expiry) when fetching media
- Store the storage path (not public URL) in `milestone_media.file_url` going forward
- Add a helper function to resolve signed URLs when displaying media in MilestoneModal, MilestoneCard, MilestoneTimeline

**Files changed**: Migration SQL, `src/hooks/useMilestones.ts`, `src/components/MilestoneModal.tsx`, `src/components/MilestoneCard.tsx`, `src/components/MilestoneTimeline.tsx`

## 2. Leaked Password Protection Disabled

**Fix**: Use `configure_auth` tool to enable leaked password protection (HaveIBeenPwned check on signup/password change).

## 3. High Severity Dependency Vulnerability (vite-plugin-pwa)

**Fix**: Update `vite-plugin-pwa` to the latest version in `package.json`.

---

## Technical Details

### Storage migration SQL
```sql
UPDATE storage.buckets SET public = false WHERE id = 'milestone-media';

DROP POLICY IF EXISTS "Anyone can view milestone media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload milestone media" ON storage.objects;

CREATE POLICY "Users can view own milestone media files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'milestone-media'
    AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload to their own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'milestone-media'
    AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own milestone media files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'milestone-media'
    AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Signed URL approach
- `useMilestones.ts` will store the **path** (e.g. `userId/milestoneId/file.jpg`) in `file_url` instead of the full public URL
- When fetching milestones, generate signed URLs (1-hour TTL) for each media item
- Components render using these signed URLs — no changes to component props needed, just the URL resolution happens in the hook

