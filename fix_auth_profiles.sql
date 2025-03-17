-- COMPLETE DATABASE FIX FOR AUTH PROFILES
-- Run this script in the Supabase SQL Editor to fix auth issues

-- 1. First, backup any existing profiles data
CREATE TABLE IF NOT EXISTS profiles_backup AS
SELECT * FROM profiles;

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can update role column" ON profiles;
DROP POLICY IF EXISTS "Only admins can update roles" ON profiles;
DROP POLICY IF EXISTS "Users can access their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;

-- 3. Drop triggers and functions
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_profile_for_user() CASCADE;
DROP FUNCTION IF EXISTS get_user_role(user_id UUID) CASCADE;
DROP FUNCTION IF EXISTS set_admin_role() CASCADE;

-- 4. Standardize auth.users table
UPDATE auth.users SET role = 'authenticated' WHERE role IS NOT NULL AND role != 'authenticated';

-- 5. Drop and recreate the profiles table
DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  location TEXT, 
  favorite_genre TEXT,
  website TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create simple, clear policies
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 8. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 9. Create profile creation trigger with better error handling
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert the profile
  INSERT INTO public.profiles (
    id, 
    email,
    full_name,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW(),
    NOW()
  )
  -- If there's a conflict, do nothing and return
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
  
  -- Catch any errors to prevent auth failures
  EXCEPTION WHEN OTHERS THEN
    -- Log the error and continue
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create the trigger
CREATE TRIGGER create_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_profile_for_user();

-- 11. Restore profiles data from backup (if it exists)
INSERT INTO profiles (
  id, full_name, bio, location, favorite_genre, 
  website, avatar_url, email, created_at, updated_at
)
SELECT 
  id, full_name, bio, location, favorite_genre,
  website, avatar_url, email,
  created_at, updated_at
FROM profiles_backup
ON CONFLICT (id) DO NOTHING;

-- 12. Create missing profiles for any users that don't have one
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
SELECT 
  au.id, 
  au.email,
  au.raw_user_meta_data->>'full_name',
  COALESCE(au.created_at, NOW()),
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL AND au.deleted_at IS NULL
ON CONFLICT (id) DO NOTHING;

-- 13. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Done! Your profiles table should now be fixed. 