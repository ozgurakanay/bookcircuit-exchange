-- Database cleanup script to match the migrations

-- 1. Drop existing triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

-- 2. Drop existing functions that are not in migrations
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS get_user_emails CASCADE;
DROP FUNCTION IF EXISTS fix_profile_auth_mapping CASCADE;
DROP FUNCTION IF EXISTS get_user_emails_simple CASCADE;
DROP FUNCTION IF EXISTS update_profile_emails CASCADE;
DROP FUNCTION IF EXISTS create_profile_for_user CASCADE;

-- 3. Drop existing policies on profiles that don't match migrations
DROP POLICY IF EXISTS "Profiles are viewable by users who created them" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- 4. Recreate profiles table to match migration
BEGIN;

-- Create a temporary table with the correct structure
CREATE TABLE IF NOT EXISTS profiles_new (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  location TEXT,
  favorite_genre TEXT,
  website TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role TEXT NOT NULL DEFAULT 'user'
);

-- Copy over the data from the old table to the new table
INSERT INTO profiles_new (id, full_name, avatar_url, created_at, updated_at)
SELECT id, full_name, avatar_url, created_at, updated_at
FROM profiles;

-- Drop the old table
DROP TABLE profiles CASCADE;

-- Rename the new table to the original name
ALTER TABLE profiles_new RENAME TO profiles;

-- 5. Recreate policies from migration
-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view any profile
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policy to restrict role updates to admins only
CREATE POLICY "Only admins can update roles" 
  ON profiles
  FOR UPDATE
  USING ((SELECT profiles_1.role FROM profiles profiles_1 WHERE profiles_1.id = auth.uid()) = 'admin');

-- 6. Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. Add function for admin role
CREATE OR REPLACE FUNCTION set_admin_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email = 'bulut.akanay@gmail.com' THEN
        UPDATE profiles SET role = 'admin' WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- 8. Create the RPC function to get emails from auth.users for the admin panel
CREATE OR REPLACE FUNCTION get_auth_user_emails()
RETURNS TABLE(id uuid, email text) SECURITY DEFINER AS $$
BEGIN
  -- Only return emails if the requesting user is an admin
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    -- Return user IDs and emails from auth.users
    RETURN QUERY 
    SELECT 
      au.id,
      au.email::text
    FROM 
      auth.users au;
  ELSE
    -- If not admin, return empty result
    RETURN QUERY SELECT NULL::uuid, NULL::text WHERE false;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Create a trigger function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  default_full_name TEXT;
BEGIN
  -- Get full_name from meta data if available
  default_full_name := COALESCE(
    (NEW.raw_user_meta_data->>'full_name')::TEXT,
    ''
  );

  -- Create a profile for the new user
  INSERT INTO public.profiles (
    id,
    full_name,
    bio,
    location,
    favorite_genre,
    website,
    avatar_url,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    default_full_name,
    '',
    '',
    '',
    '',
    '',
    'user',
    NOW(),
    NOW()
  )
  -- If a profile already exists, do nothing
  ON CONFLICT (id) DO NOTHING;

  -- Set admin role for specific users (e.g., bulut.akanay@gmail.com)
  IF NEW.email = 'bulut.akanay@gmail.com' THEN
    UPDATE profiles SET role = 'admin' WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user_registration();

-- 11. Create trigger for the admin role function
CREATE TRIGGER set_admin_role_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION set_admin_role();

-- 12. Update blog_posts policies to use the role column
-- First, drop the existing policies
DROP POLICY IF EXISTS "Only admins can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Only admins can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Only admins can delete blog posts" ON blog_posts;

-- Recreate with the role column check
CREATE POLICY "Only admins can insert blog posts"
  ON blog_posts
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update blog posts"
  ON blog_posts
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete blog posts"
  ON blog_posts
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 13. Update storage policies for blog images
DROP POLICY IF EXISTS "Only admins can insert blog images" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete blog images" ON storage.objects;

CREATE POLICY "Only admins can insert blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images' AND
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update blog images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'blog-images' AND
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete blog images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'blog-images' AND
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
