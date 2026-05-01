import { SportsEvent } from './types';

// Placeholder image for future events
const placeholderImg = 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=2000&auto=format&fit=crop';

export const EVENTS: SportsEvent[] = [
  {
    id: 'placeholder-1',
    title: 'Upcoming Adventure Trail',
    date: 'TBA 2026',
    location: 'Hidden Location',
    price_range: 'RM0.00',
    category: 'Trail',
    status: 'draft', // Changed from 'Archived' to valid status
    banner_image: placeholderImg,
    description: 'This is a placeholder for a future event. Organizers will be able to add their own events here soon.',
    organizer_id: '',
    variants: []
  },
  {
    id: 'placeholder-2',
    title: 'Neon Night Run Series',
    date: 'TBA 2026',
    location: 'Metropolitan Area',
    price_range: 'RM0.00',
    category: 'Night',
    status: 'draft',
    banner_image: placeholderImg,
    description: 'This is a placeholder for a future event. Organizers will be able to add their own events here soon.',
    organizer_id: '',
    variants: []
  },
  {
    id: 'placeholder-3',
    title: 'Ultra Endurance Challenge',
    date: 'TBA 2026',
    location: 'Mountain Range',
    price_range: 'RM0.00',
    category: 'Ultra',
    status: 'draft',
    banner_image: placeholderImg,
    description: 'This is a placeholder for a future event. Organizers will be able to add their own events here soon.',
    organizer_id: '',
    variants: []
  }
];
