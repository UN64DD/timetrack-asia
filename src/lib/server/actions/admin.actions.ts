'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function adminUpdateUserRoleAction(userId: string, newRole: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const role = user.user_metadata?.role;
  if (role !== 'SUPER_ADMIN') throw new Error('Forbidden');

  // Update in public.users
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  // Update in auth.users metadata
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: newRole },
  });

  revalidatePath('/admin/dashboard', 'page');
}

export async function adminToggleUserStatusAction(userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const role = user.user_metadata?.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') throw new Error('Forbidden');

  const { error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  if (status === 'BANNED') {
    await supabase.auth.admin.deleteUser(userId);
  }

  revalidatePath('/admin/dashboard', 'page');
}

export async function adminDeleteUserAction(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const role = user.user_metadata?.role;
  if (role !== 'SUPER_ADMIN') throw new Error('Forbidden');

  await supabase.from('users').update({ deleted_at: new Date().toISOString(), status: 'BANNED' }).eq('id', userId);
  await supabase.auth.admin.deleteUser(userId);

  revalidatePath('/admin/dashboard', 'page');
}

export async function adminSystemAction(action: string, metadata?: Record<string, unknown>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const role = user.user_metadata?.role;
  if (role !== 'SUPER_ADMIN') throw new Error('Forbidden');

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action,
    module: 'admin',
    metadata: metadata || null,
  });

  revalidatePath('/admin/dashboard', 'page');
}
