#!/bin/bash

# This script applies the database changes to your Supabase project
# You'll need to have Supabase CLI installed
# Run with: bash apply_db_changes.sh

# Set variables for your Supabase project
SUPABASE_URL="https://ecqcfdtpjoarlofecmir.supabase.co"
SUPABASE_DB_URL="postgresql://postgres.ecqcfdtpjoarlofecmir:gazzYd-hodgip-gurky8@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Apply the database cleanup script
echo "Applying database changes..."
psql "$SUPABASE_DB_URL" -f database_cleanup.sql

# Create additional profiles for any users missing them
echo "Creating profiles for existing users..."
psql "$SUPABASE_DB_URL" -c "
DO \$\$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, email FROM auth.users WHERE id NOT IN (SELECT id FROM profiles)
  LOOP
    INSERT INTO profiles (
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
      user_record.id,
      '',
      '',
      '',
      '',
      '',
      '',
      CASE WHEN user_record.email = 'bulut.akanay@gmail.com' THEN 'admin' ELSE 'user' END,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END;
\$\$;
"

echo "Database changes applied successfully!" 