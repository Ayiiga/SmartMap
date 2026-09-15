-- Google OAuth profile support + profile insert policy (fallback)

-- Allow users to create their own profile if trigger did not run
DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Improve new-user trigger for Google OAuth metadata (name, picture)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_full_name TEXT;
  meta_avatar TEXT;
  meta_role user_role;
BEGIN
  meta_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(COALESCE(NEW.email, 'user'), '@', 1)
  );

  meta_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  BEGIN
    meta_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student');
  EXCEPTION WHEN OTHERS THEN
    meta_role := 'student';
  END;

  INSERT INTO profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    meta_full_name,
    meta_avatar,
    meta_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    email = EXCLUDED.email;

  INSERT INTO gamification (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
