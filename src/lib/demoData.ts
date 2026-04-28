import urbanCyclops from '../assets/urban_cyclops.png';

export const SHOWCASE_EVENTS = [
  {
    id: 'demo-1',
    title: 'Neon Night Run: Kuala Lumpur',
    description: 'Experience the city like never before. A 5KM/10KM night run through the glowing heart of KL, featuring live DJs and neon light installations at every kilometer.',
    date: '2026-05-15',
    location: 'Dataran Merdeka, KL',
    category: 'Running',
    status: 'Open',
    image_url: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?q=80&w=2000',
    price_min: 65,
    price_max: 120,
    variants: [
      { id: 'v1', name: '5KM Fun Run', price: 65 },
      { id: 'v2', name: '10KM Competitive', price: 95 },
      { id: 'v3', name: 'VIP Ultra Glow Package', price: 120 }
    ],
    registration_config: {
      billing: { first_name: true, phone: true, email: true },
      attendee: { full_name: true, ic_passport: true, dob: true, gender: true, emergency_name: true, emergency_phone: true }
    }
  },
  {
    id: 'demo-2',
    title: 'Ultra Trail X-TREME: Genting Highlands',
    description: 'The ultimate test of endurance. Traverse the rugged peaks and mist-covered forests of Genting Highlands in this 50KM/100KM ultra-marathon.',
    date: '2026-06-20',
    location: 'Genting Highlands, Pahang',
    category: 'Trail',
    status: 'Open',
    image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2000',
    price_min: 150,
    price_max: 350,
    variants: [
      { id: 'v1', name: '50KM Mountain Run', price: 150 },
      { id: 'v2', name: '100KM Elite Trail', price: 350 }
    ],
    registration_config: {
      billing: { first_name: true, phone: true, email: true },
      attendee: { full_name: true, ic_passport: true, dob: true, gender: true, emergency_name: true, emergency_phone: true }
    }
  },
  {
    id: 'demo-3',
    title: 'Urban Cyclops Criterium',
    description: 'High-speed city circuit cycling. Watch the elites battle it out or join the community ride on a closed-road course in the heart of the capital.',
    date: '2026-07-04',
    location: 'Putrajaya Circuit',
    category: 'Cycling',
    status: 'Upcoming',
    image_url: urbanCyclops,
    price_min: 45,
    price_max: 85,
    variants: [
      { id: 'v1', name: 'Community Ride (20KM)', price: 45 },
      { id: 'v2', name: 'Pro Crit Race (50KM)', price: 85 }
    ],
    registration_config: {
      billing: { first_name: true, phone: true, email: true },
      attendee: { full_name: true, ic_passport: true, dob: true, gender: true, emergency_name: true, emergency_phone: true }
    }
  },
  {
    id: 'demo-4',
    title: 'Iron Aura Triathlon',
    description: 'Swim, Bike, Run. Test your limits across three disciplines in the beautiful coastal setting of Desaru.',
    date: '2026-08-12',
    location: 'Desaru Coast, Johor',
    category: 'Triathlon',
    status: 'Open',
    image_url: 'https://images.unsplash.com/photo-1530549387631-6c12946b994d?q=80&w=2000',
    price_min: 220,
    price_max: 480,
    variants: [
      { id: 'v1', name: 'Sprint Distance', price: 220 },
      { id: 'v2', name: 'Olympic Distance', price: 350 },
      { id: 'v3', name: 'Full Iron Aura', price: 480 }
    ],
    registration_config: {
      billing: { first_name: true, phone: true, email: true },
      attendee: { full_name: true, ic_passport: true, dob: true, gender: true, emergency_name: true, emergency_phone: true }
    }
  }
];
