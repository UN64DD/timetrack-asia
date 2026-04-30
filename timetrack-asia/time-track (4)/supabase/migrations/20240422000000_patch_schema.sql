-- TACTICAL SCHEMA PATCH: Run these commands in the Supabase SQL Editor

-- 1. Add Registration Configuration Column
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS registration_config JSONB DEFAULT '{
  "billing": {
    "first_name": true,
    "phone": true,
    "email": true,
    "persons_count": true,
    "country": true,
    "town_city": true,
    "postcode": true
  },
  "attendee": {
    "full_name": true,
    "bib_name": false,
    "email": true,
    "phone": true,
    "gender": true,
    "ic_passport": true,
    "dob": true,
    "age": true,
    "address": false,
    "postcode": false,
    "country": false,
    "category_age": true,
    "medical_status": false,
    "medical_details": false,
    "emergency_name": true,
    "emergency_phone": true
  }
}'::jsonb;

-- 2. Add Variants Column (if missing)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- 3. Ensure Price column exists (if used instead of price_range)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;

-- 4. Sync banner_image column (Ensuring it exists as expected by the code)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='banner_image') THEN
    ALTER TABLE events ADD COLUMN banner_image TEXT;
  END IF;
END $$;
