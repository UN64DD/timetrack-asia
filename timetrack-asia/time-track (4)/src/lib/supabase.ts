import { createClient } from '@supabase/supabase-js';
import type { SportsEvent, EventVariant, Registration } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Authentication will be limited.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// QUERY FUNCTIONS
// ============================================

export interface FetchEventsFilters {
  status?: string;
  category?: string;
  organizerId?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status?: string;
  banner_image?: string;
  image_url?: string;
  price_range?: string;
  organizer_id: string;
  registration_config?: Record<string, any>;
}

export interface CreateVariantData {
  name: string;
  price: number;
}

/**
 * Fetch events with their variants using Supabase relational queries
 */
export async function fetchEventsWithVariants({ filters = {}, limit }: { filters?: FetchEventsFilters; limit?: number } = {}) {
  try {
    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        date,
        location,
        category,
        status,
        banner_image,
        image_url,
        price_range,
        organizer_id,
        created_at,
        event_variants (
          id,
          name,
          price,
          created_at
        )
      `)
      .neq('status', 'archived');

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.organizerId) query = query.eq('organizer_id', filters.organizerId);

    query = query.order('date', { ascending: true });
    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Fetch events error:', error);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected fetch error:', err);
    throw err;
  }
}

/**
 * Create event with variants (handles rollback if variants fail)
 */
export async function createEventWithVariants(eventData: CreateEventData, variants: CreateVariantData[] = []) {
  try {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([{
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        category: eventData.category,
        status: eventData.status || 'draft',
        banner_image: eventData.banner_image,
        image_url: eventData.image_url,
        price_range: eventData.price_range,
        organizer_id: eventData.organizer_id,
        registration_config: eventData.registration_config || {}
      }])
      .select()
      .single();

    if (eventError) {
      throw new Error(`Event creation failed: ${eventError.message}`);
    }

    if (variants.length > 0) {
      const variantsToInsert = variants.map(variant => ({
        event_id: event.id,
        name: variant.name,
        price: parseFloat(String(variant.price)) || 0
      }));

      const { error: variantsError } = await supabase
        .from('event_variants')
        .insert(variantsToInsert);

      if (variantsError) {
        await supabase.from('events').delete().eq('id', event.id);
        throw new Error(`Variant creation failed: ${variantsError.message}`);
      }
    }

    return event;
  } catch (err) {
    console.error('Event creation error:', err);
    throw err;
  }
}

/**
 * Register user for event (with duplicate check)
 */
export async function registerUserForEvent(userId: string, eventId: string, variantId: string) {
  try {
    const { data: existingReg, error: checkError } = await supabase
      .from('registrations')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .eq('variant_id', variantId)
      .maybeSingle();

    if (checkError) {
      throw new Error(`Registration check failed: ${checkError.message}`);
    }

    if (existingReg) {
      throw new Error('User already registered for this event variant');
    }

    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert([{
        user_id: userId,
        event_id: eventId,
        variant_id: variantId,
        status: 'pending'
      }])
      .select()
      .single();

    if (regError) {
      throw new Error(`Registration failed: ${regError.message}`);
    }

    return registration;
  } catch (err) {
    console.error('Registration error:', err);
    throw err;
  }
}
