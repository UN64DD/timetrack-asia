import { SportsEvent } from './types';

// Placeholder image for future events
const placeholderImg = 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=2000&auto=format&fit=crop';

export const EVENTS: SportsEvent[] = [
  {
    id: 'placeholder-1',
    title: 'Upcoming Adventure Trail',
    date: 'TBA 2026',
    location: 'Hidden Location',
    price: 'RM0.00',
    category: 'Trail',
    status: 'Archived', // Using Archived status to keep it non-interactive for now
    image: placeholderImg,
    description: 'This is a placeholder for a future event. Organizers will be able to add their own events here soon.',
    variants: []
  },
  {
    id: 'placeholder-2',
    title: 'Neon Night Run Series',
    date: 'TBA 2026',
    location: 'Metropolitan Area',
    price: 'RM0.00',
    category: 'Night',
    status: 'Archived',
    image: placeholderImg,
    description: 'This is a placeholder for a future event. Organizers will be able to add their own events here soon.',
    variants: []
  },
  {
    id: 'placeholder-3',
    title: 'Ultra Endurance Challenge',
    date: 'TBA 2026',
    location: 'Mountain Range',
    price: 'RM0.00',
    category: 'Ultra',
    status: 'Archived',
    image: placeholderImg,
    description: 'This is a placeholder for a future event. Organizers will be able to add their own events here soon.',
    variants: []
  }
];
