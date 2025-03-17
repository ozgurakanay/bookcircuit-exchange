-- SQL script to clean up role-related functions and policies

-- Drop role-related policies
DROP POLICY IF EXISTS "Only admins can update role column" ON profiles;
DROP POLICY IF EXISTS "Users can access their own profile" ON profiles;

-- Drop get_user_role function 
DROP FUNCTION IF EXISTS get_user_role(user_id UUID);

-- Recreate simplified policies for profiles
CREATE POLICY IF NOT EXISTS "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id); 