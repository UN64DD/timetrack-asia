-- Create User Profiles with Roles
CREATE TYPE user_role AS ENUM ('athlete', 'organizer', 'admin');

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role user_role DEFAULT 'athlete',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  price_range TEXT,
  category TEXT,
  status TEXT DEFAULT 'Open',
  image_url TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone." ON events
  FOR SELECT USING (true);

CREATE POLICY "Organizers can create events." ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('organizer', 'admin')
    )
  );

CREATE POLICY "Organizers can update their own events." ON events
  FOR UPDATE USING (organizer_id = auth.uid());

-- Create Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  variant_id TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Registrations
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations." ON registrations
  FOR SELECT USING (athlete_id = auth.uid() OR EXISTS (
    SELECT 1 FROM events WHERE events.id = event_id AND events.organizer_id = auth.uid()
  ));

CREATE POLICY "Athletes can register for events." ON registrations
  FOR INSERT WITH CHECK (auth.uid() = athlete_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, (new.raw_user_meta_data->>'role')::user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
