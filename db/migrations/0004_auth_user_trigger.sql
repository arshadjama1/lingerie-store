-- ══════════════════════════════════════════════════════════════════════
-- 0004_auth_user_trigger.sql
--
-- Automatically creates a corresponding row in public.profiles whenever
-- a new user is created in auth.users (via Email, OTP, OAuth, or Admin).
-- ══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, role)
  VALUES (
    new.id,
    new.email,
    new.phone,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
