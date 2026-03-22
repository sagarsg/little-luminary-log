-- Fix profiles insert policy for handle_new_user trigger (needs service role, not just authenticated)
-- The trigger runs as SECURITY DEFINER so it bypasses RLS, no change needed there.
-- But we need to ensure the handle_new_user trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();