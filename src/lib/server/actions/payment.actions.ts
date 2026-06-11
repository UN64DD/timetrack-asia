'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPaymentAction(registrationId: string, gateway: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: reg, error: regError } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .eq('athlete_id', user.id)
    .single();

  if (regError || !reg) throw new Error('Registration not found');
  if (reg.net_amount <= 0) throw new Error('No payment required');

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      registration_id: registrationId,
      payment_gateway: gateway,
      amount: reg.net_amount,
      currency: 'MYR',
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/profile`, 'page');

  return payment;
}

export async function adminApprovePaymentAction(paymentId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const role = user.user_metadata?.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') throw new Error('Forbidden');

  const { data: payment, error: payError } = await supabase
    .from('payments')
    .update({ status: 'SUCCESS' })
    .eq('id', paymentId)
    .select('registration_id')
    .single();

  if (payError) throw new Error(payError.message);

  await supabase
    .from('registrations')
    .update({ status: 'PAID' })
    .eq('id', payment.registration_id);

  revalidatePath('/admin/dashboard', 'page');
}

export async function adminRejectPaymentAction(paymentId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const role = user.user_metadata?.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') throw new Error('Forbidden');

  const { error } = await supabase
    .from('payments')
    .update({ status: 'FAILED' })
    .eq('id', paymentId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/dashboard', 'page');
}

export async function processRefundAction(refundId: string, approve: boolean) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const role = user.user_metadata?.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') throw new Error('Forbidden');

  const status = approve ? 'REFUNDED' : 'REFUND_REJECTED';

  const { data: refund, error: refError } = await supabase
    .from('refunds')
    .update({ status, processed_at: new Date().toISOString() })
    .eq('id', refundId)
    .select('registration_id')
    .single();

  if (refError) throw new Error(refError.message);

  if (approve) {
    await supabase
      .from('registrations')
      .update({ status: 'REFUNDED' })
      .eq('id', refund.registration_id);
  }

  revalidatePath('/admin/dashboard', 'page');
}
