SQL script to clean up your database:

-- Create a simplified profiles table while preserving existing data
CREATE TABLE IF NOT EXISTS profiles_new (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Copy only the essential data
INSERT INTO profiles_new (id, email, full_name, avatar_url, created_at, updated_at)
SELECT id, email, full_name, avatar_url, created_at, updated_at
FROM profiles;

-- Drop the old table and rename the new one
DROP TABLE profiles;
ALTER TABLE profiles_new RENAME TO profiles;

-- Create proper indexes
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);

-- Drop any backup tables
DROP TABLE IF EXISTS profiles_backup;

-- Set up proper RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies
DROP POLICY IF EXISTS "Profiles are viewable by users who created them" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simple policies
CREATE POLICY "Profiles are viewable by users who created them"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS 71109
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now());
  RETURN new;
END;
71109 LANGUAGE plpgsql SECURITY DEFINER;

-- Set up the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
