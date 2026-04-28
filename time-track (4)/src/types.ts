export type SportsCategory = 'Trail' | 'Night' | 'Ultra' | 'Road' | 'Running' | 'Cycling';
export type UserRole = 'athlete' | 'organizer' | 'admin';

export interface EventVariant {
  id: string;
  event_id: string;
  name: string;
  price: number;
  created_at?: string;
}

export interface SportsEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: 'upcoming' | 'live' | 'completed' | 'draft' | 'published' | 'closed';
  banner_image?: string;
  image_url?: string;
  price_range?: string;
  registration_config?: Record<string, any>;
  organizer_id: string;
  variants?: EventVariant[];
  created_at?: string;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  variant_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
}
