'use server';

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import slugify from 'slugify';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  event_date: z.string(),
  registration_open: z.string(),
  registration_close: z.string(),
  venue_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  max_participants: z.number().optional(),
  bib_format: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  coupons_allowed: z.boolean().optional(),
});

export async function createEventAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const categoriesJson = formData.get('categories') as string;
  const categories = categoriesJson ? JSON.parse(categoriesJson) : [];

  const parsed = eventSchema.parse({
    title,
    description: formData.get('description'),
    event_date: formData.get('event_date'),
    registration_open: formData.get('registration_open'),
    registration_close: formData.get('registration_close'),
    venue_name: formData.get('venue_name'),
    address: formData.get('address'),
    city: formData.get('city'),
    postcode: formData.get('postcode'),
    country: formData.get('country'),
    max_participants: formData.get('max_participants') ? Number(formData.get('max_participants')) : undefined,
    bib_format: formData.get('bib_format') || 'RUN-####',
    terms_and_conditions: formData.get('terms_and_conditions'),
    coupons_allowed: formData.get('coupons_allowed') === 'true',
  });

  const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      ...parsed,
      slug,
      organizer_id: user.id,
      status: 'DRAFT',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (categories.length > 0) {
    const { error: catError } = await supabase
      .from('event_categories')
      .insert(categories.map((cat: any) => ({ ...cat, event_id: event.id })));

    if (catError) throw new Error(catError.message);
  }

  revalidatePath('/organizer/dashboard', 'page');
  redirect(`/organizer/dashboard/events/${event.id}`);
}

export async function updateEventStatusAction(eventId: string, status: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', eventId)
    .eq('organizer_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/organizer/dashboard', 'page');
}

export async function deleteEventAction(eventId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', eventId)
    .eq('organizer_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/organizer/dashboard', 'page');
}

export async function adminUpdateEventStatusAction(eventId: string, status: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const role = user.user_metadata?.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') throw new Error('Forbidden');

  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', eventId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/dashboard', 'page');
}
