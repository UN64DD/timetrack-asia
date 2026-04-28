-- ==========================================
-- TIME TRACK FINAL DEMO SCHEMA
-- 100% READY FOR DEPLOYMENT (EXCL. PAYMENTS)
-- ==========================================

-- 1. EXTEND ROLES (Check if exists first)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('athlete', 'organizer', 'admin', 'root');
  ELSE
    -- Add root if it doesn't exist in enum
    BEGIN
      ALTER TYPE user_role ADD VALUE 'root';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END;
  END IF;
END $$;

-- 2. ENHANCED PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role user_role DEFAULT 'athlete',
  phone TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENHANCED EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  location TEXT NOT NULL,
  location_lat NUMERIC,
  location_lng NUMERIC,
  category TEXT, -- Running, Cycling, etc.
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Open', 'Closed', 'Archived')),
  price_min NUMERIC DEFAULT 0,
  price_max NUMERIC DEFAULT 0,
  banner_image TEXT,
  variants JSONB DEFAULT '[]'::jsonb, -- [{id, name, price, capacity, category_age}]
  registration_config JSONB DEFAULT '{
    "billing": {"first_name": true, "phone": true, "email": true},
    "attendee": {"full_name": true, "ic_passport": true, "dob": true, "gender": true, "emergency_name": true, "emergency_phone": true}
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
  registration_data JSONB NOT NULL, -- Detailed attendee info
  bib_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  bib_number TEXT NOT NULL,
  category TEXT,
  rank_overall INTEGER,
  rank_category INTEGER,
  finish_time TEXT NOT NULL,
  pace TEXT,
  certificate_url TEXT,
  raw_data JSONB, -- For extra stats (split times, etc)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SYSTEM LOGS (For Root)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- STORAGE BUCKETS SETUP
-- ==========================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('results', 'results', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- RLS POLICIES (SECURITY PROTOCOL)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Profiles: Read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles: Self Update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles: Root/Admin full control" ON public.profiles 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'root'))
);

-- 2. Events Policies
CREATE POLICY "Events: Public view" ON public.events FOR SELECT USING (true);
CREATE POLICY "Events: Organizer Create" ON public.events FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin', 'root'))
);
CREATE POLICY "Events: Organizer Update Own" ON public.events FOR UPDATE 
USING (
  organizer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'root'))
);
CREATE POLICY "Events: Root/Admin Delete" ON public.events FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'root'))
);

-- 3. Registrations Policies
CREATE POLICY "Registrations: View Own" ON public.registrations FOR SELECT 
USING (
  athlete_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.events WHERE events.id = event_id AND events.organizer_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'root'))
);
CREATE POLICY "Registrations: Athlete Insert" ON public.registrations FOR INSERT 
WITH CHECK (auth.uid() = athlete_id);

-- 4. Results Policies
CREATE POLICY "Results: Public view" ON public.results FOR SELECT USING (true);
CREATE POLICY "Results: Manage by Organizer/Admin" ON public.results FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.events WHERE events.id = event_id AND events.organizer_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'root'))
);

-- 5. Storage Policies (Public Read)
CREATE POLICY "Public Read Banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Public Read Results" ON storage.objects FOR SELECT USING (bucket_id = 'results');
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- 6. Storage Policies (Write)
CREATE POLICY "Organizer Upload Banners" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'banners' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin', 'root'))
);

CREATE POLICY "Organizer Upload Results" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'results' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin', 'root'))
);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'athlete'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- View for Admin Stats
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'athlete') as total_athletes,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'organizer') as total_organizers,
  (SELECT COUNT(*) FROM public.events WHERE status = 'Open') as active_events,
  (SELECT COUNT(*) FROM public.registrations) as total_registrations;
