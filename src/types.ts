export type SportsCategory = 'Trail' | 'Night' | 'Ultra' | 'Road' | 'Running' | 'Cycling';

export interface EventVariant {
  id: number;
  attributes: Record<string, string>;
  price: number;
  availability: string;
}

export interface SportsEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  category: string;
  status: 'Open' | 'Closed' | 'Archived';
  image?: string;
  description?: string;
  variants?: EventVariant[];
  subEvents?: SportsEvent[];
  url?: string;
}
