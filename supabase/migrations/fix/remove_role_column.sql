-- SQL script to remove role column and related functionality from the database

-- Drop policy that restricts role updates to admins
DROP POLICY IF EXISTS "Only admins can update roles" ON profiles;

-- Drop function used to set admin role
DROP FUNCTION IF EXISTS set_admin_role() CASCADE;

-- Remove role column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Update auth.users roles to authenticated if needed
UPDATE auth.users SET role = 'authenticated' WHERE role IS NOT NULL AND role != 'authenticated'; 