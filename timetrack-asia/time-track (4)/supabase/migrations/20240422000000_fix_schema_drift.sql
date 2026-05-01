-- PERMANENT FIX: Resolve Schema Drift and Refresh PostgREST Cache
-- Run this in the Supabase SQL Editor to synchronize your database with the current application code.

-- 1. Update Profiles Table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- 2. Update Events Table (Ensure all columns from Event Forge exist)
DO $$ 
BEGIN
  -- Add price_range
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='price_range') THEN
    ALTER TABLE public.events ADD COLUMN price_range TEXT;
  END IF;
  
  -- Add category
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='category') THEN
    ALTER TABLE public.events ADD COLUMN category TEXT;
  END IF;
  
  -- Add image_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='image_url') THEN
    ALTER TABLE public.events ADD COLUMN image_url TEXT;
  END IF;

  -- Add banner_image (for legacy support)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='banner_image') THEN
    ALTER TABLE public.events ADD COLUMN banner_image TEXT;
  END IF;
  
  -- Add variants
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='variants') THEN
    ALTER TABLE public.events ADD COLUMN variants JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add registration_config
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='registration_config') THEN
    ALTER TABLE public.events ADD COLUMN registration_config JSONB DEFAULT '{
      "billing": {"first_name": true, "phone": true, "email": true, "persons_count": true, "country": true, "town_city": true, "postcode": true},
      "attendee": {"full_name": true, "bib_name": false, "email": true, "phone": true, "gender": true, "ic_passport": true, "dob": true, "age": true, "address": false, "postcode": false, "country": false, "category_age": true, "medical_status": false, "medical_details": false, "emergency_name": true, "emergency_phone": true}
    }'::jsonb;
  END IF;
END $$;

-- 3. Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
COMMENT ON TABLE public.profiles IS 'User profiles for Time Track system';
COMMENT ON TABLE public.events IS 'Event registry for Time Track system';
