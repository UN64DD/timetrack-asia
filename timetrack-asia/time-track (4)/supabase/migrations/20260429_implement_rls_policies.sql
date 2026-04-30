-- RLS Policies Implementation for Time Track Asia
-- Requirements:
-- 1. Users manage only their own profile
-- 2. Organizers manage only their own events and variants
-- 3. Public can view events
-- 4. Users can only register once per event (handled by unique constraint)
-- 5. Users can only view their own registrations
-- 6. Admin has full access

-- =============================================
-- HELPER FUNCTION: Check if user is admin
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Select: Users can view own profile OR admin can view all
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (
  auth.uid() = id OR 
  is_admin()
);

-- Insert: Users can only insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Update: Users can update own profile OR admin can update any
CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (
  auth.uid() = id OR 
  is_admin()
) WITH CHECK (
  auth.uid() = id OR 
  is_admin()
);

-- Delete: Only admin can delete profiles (protect root email)
CREATE POLICY "profiles_delete_policy" ON profiles
FOR DELETE USING (
  is_admin() AND 
  email != 'nithyananthanimalan@gmail.com'
);

-- =============================================
-- EVENTS TABLE POLICIES
-- =============================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Events are viewable by everyone." ON events;
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Organizers can create events." ON events;
DROP POLICY IF EXISTS "Organizers can update their own events." ON events;
DROP POLICY IF EXISTS "Organizers can manage own events" ON events;

-- Select: Public can view all events OR admin can view all
CREATE POLICY "events_select_policy" ON events
FOR SELECT USING (true);

-- Insert: Organizers can create events OR admin can create any
CREATE POLICY "events_insert_policy" ON events
FOR INSERT WITH CHECK (
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin'))) AND
  (auth.uid() = organizer_id OR is_admin())
);

-- Update: Organizers can update own events OR admin can update any
CREATE POLICY "events_update_policy" ON events
FOR UPDATE USING (
  auth.uid() = organizer_id OR 
  is_admin()
) WITH CHECK (
  auth.uid() = organizer_id OR 
  is_admin()
);

-- Delete: Organizers can delete own events OR admin can delete any
CREATE POLICY "events_delete_policy" ON events
FOR DELETE USING (
  auth.uid() = organizer_id OR 
  is_admin()
);

-- =============================================
-- EVENT_VARIANTS TABLE POLICIES
-- =============================================
ALTER TABLE event_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Event variants follow event access" ON event_variants;

-- Select: Public can view all event variants
CREATE POLICY "event_variants_select_policy" ON event_variants
FOR SELECT USING (true);

-- Insert: Organizers can insert variants for their own events OR admin
CREATE POLICY "event_variants_insert_policy" ON event_variants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_variants.event_id 
    AND events.organizer_id = auth.uid()
  ) OR 
  is_admin()
);

-- Update: Organizers can update variants for their own events OR admin
CREATE POLICY "event_variants_update_policy" ON event_variants
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_variants.event_id 
    AND events.organizer_id = auth.uid()
  ) OR 
  is_admin()
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_variants.event_id 
    AND events.organizer_id = auth.uid()
  ) OR 
  is_admin()
);

-- Delete: Organizers can delete variants for their own events OR admin
CREATE POLICY "event_variants_delete_policy" ON event_variants
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_variants.event_id 
    AND events.organizer_id = auth.uid()
  ) OR 
  is_admin()
);

-- =============================================
-- REGISTRATIONS TABLE POLICIES
-- =============================================
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own registrations." ON registrations;
DROP POLICY IF EXISTS "Users can manage own registrations" ON registrations;
DROP POLICY IF EXISTS "Organizers can view registrations for their events" ON registrations;
DROP POLICY IF EXISTS "Athletes can register for events." ON registrations;

-- Select: Users can view only their own registrations OR admin can view all
CREATE POLICY "registrations_select_policy" ON registrations
FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin()
);

-- Insert: Users can register themselves (once per event/variant - enforced by DB constraint)
CREATE POLICY "registrations_insert_policy" ON registrations
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  is_admin()
);

-- Update: Only admin can update registrations
CREATE POLICY "registrations_update_policy" ON registrations
FOR UPDATE USING (
  is_admin()
) WITH CHECK (
  is_admin()
);

-- Delete: Only admin can delete registrations
CREATE POLICY "registrations_delete_policy" ON registrations
FOR DELETE USING (
  is_admin()
);

-- =============================================
-- AUDIT_LOGS TABLE POLICIES (if exists)
-- =============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "audit_logs_select_policy" ON audit_logs;
    DROP POLICY IF EXISTS "audit_logs_insert_policy" ON audit_logs;
    
    -- Only admin can view audit logs
    CREATE POLICY "audit_logs_select_policy" ON audit_logs
    FOR SELECT USING (is_admin());
    
    -- Only admin can create audit logs (via the function)
    CREATE POLICY "audit_logs_insert_policy" ON audit_logs
    FOR INSERT WITH CHECK (is_admin());
  END IF;
END $$;

-- =============================================
-- RELOAD SCHEMA CACHE
-- =============================================
NOTIFY pgrst, 'reload schema';

COMMENT ON TABLE public.profiles IS 'User profiles - RLS: users manage own, admin full access';
COMMENT ON TABLE public.events IS 'Events - RLS: public read, organizers manage own, admin full access';
COMMENT ON TABLE public.event_variants IS 'Event variants - RLS: public read, organizers manage own events variants, admin full access';
COMMENT ON TABLE public.registrations IS 'Registrations - RLS: users view own, admin full access';
