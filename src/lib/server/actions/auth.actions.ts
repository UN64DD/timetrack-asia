'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirectTo') as string) || '/';

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  revalidatePath('/', 'layout');
  redirect(redirectTo);
}

export async function signUpAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'ATHLETE';
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, first_name: firstName, last_name: lastName },
    },
  });

  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) throw new Error(error.message);
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;
  const avatarUrl = formData.get('avatarUrl') as string;

  const { error } = await supabase.auth.updateUser({
    data: { first_name: firstName, last_name: lastName, phone: phone, avatar_url: avatarUrl },
  });

  if (error) throw new Error(error.message);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error: dbError } = await supabase
      .from('users')
      .update({ first_name: firstName, last_name: lastName, phone: phone, avatar_url: avatarUrl })
      .eq('id', user.id);
    if (dbError) throw new Error(dbError.message);
  }

  revalidatePath('/profile', 'page');
}
