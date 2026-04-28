-- Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('athlete', 'organizer', 'admin');

-- Update profiles table
ALTER TABLE profiles
ADD CONSTRAINT fk_profiles_auth_users
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE profiles
ALTER COLUMN role DROP DEFAULT;

ALTER TABLE profiles
ALTER COLUMN role TYPE user_role USING role::user_role;

ALTER TABLE profiles
ALTER COLUMN role SET DEFAULT 'athlete'::user_role;

-- Add status column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Update events table with foreign key
ALTER TABLE events
ADD CONSTRAINT fk_events_organizer
FOREIGN KEY (organizer_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Update event_variants table
ALTER TABLE event_variants
ADD CONSTRAINT fk_event_variants_event
FOREIGN KEY (event_id)
REFERENCES events(id)
ON DELETE CASCADE;

ALTER TABLE event_variants
ADD CONSTRAINT unique_event_variant_name
UNIQUE (event_id, name);

-- Add unique constraint on id + event_id for composite FK support
ALTER TABLE event_variants
ADD CONSTRAINT unique_event_variants_id_event
UNIQUE (id, event_id);

-- Update registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS variant_id UUID;

-- Add foreign keys for registrations
ALTER TABLE registrations
ADD CONSTRAINT fk_registrations_user
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE registrations
ADD CONSTRAINT fk_registrations_event
FOREIGN KEY (event_id)
REFERENCES events(id)
ON DELETE CASCADE;

ALTER TABLE registrations
ADD CONSTRAINT fk_registrations_variant_event
FOREIGN KEY (variant_id, event_id)
REFERENCES event_variants(id, event_id)
ON DELETE CASCADE;

-- Prevent duplicate registrations
ALTER TABLE registrations
ADD CONSTRAINT unique_registration
UNIQUE (user_id, event_id, variant_id);

-- Make variant_id required
ALTER TABLE registrations
ALTER COLUMN variant_id SET NOT NULL;

-- Add registration_config column to events if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'events' AND column_name = 'registration_config') THEN
    ALTER TABLE events ADD COLUMN registration_config JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add price_range column to events if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'events' AND column_name = 'price_range') THEN
    ALTER TABLE events ADD COLUMN price_range TEXT;
  END IF;
END $$;

-- Add image_url column to events if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'events' AND column_name = 'image_url') THEN
    ALTER TABLE events ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_registrations_user_event 
ON registrations(user_id, event_id);

CREATE INDEX IF NOT EXISTS idx_event_variants_event 
ON event_variants(event_id);

CREATE INDEX IF NOT EXISTS idx_events_organizer 
ON events(organizer_id);

-- Update RLS policies (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own profile, organizers can read all
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Events: public read for published, organizers can manage own
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON events;
CREATE POLICY "Published events are viewable by everyone" ON events
  FOR SELECT USING (status = 'published' OR organizer_id = auth.uid());

DROP POLICY IF EXISTS "Organizers can manage own events" ON events;
CREATE POLICY "Organizers can manage own events" ON events
  FOR ALL USING (organizer_id = auth.uid());

-- Event variants: follow event permissions
DROP POLICY IF EXISTS "Event variants follow event access" ON event_variants;
CREATE POLICY "Event variants follow event access" ON event_variants
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid() OR status = 'published')
  );

-- Registrations: users can view/update own, organizers can view for their events
DROP POLICY IF EXISTS "Users can manage own registrations" ON registrations;
CREATE POLICY "Users can manage own registrations" ON registrations
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Organizers can view registrations for their events" ON registrations;
CREATE POLICY "Organizers can view registrations for their events" ON registrations
  FOR SELECT USING (
    event_id IN (SELECT id FROM events WHERE organizer_id = auth.uid())
  );
