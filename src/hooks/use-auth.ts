'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { AuthUser, Role } from '@/lib/types';

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: (meta?.role as Role) || 'ATHLETE',
          firstName: meta?.first_name || meta?.full_name?.split(' ')[0],
          lastName: meta?.last_name || meta?.full_name?.split(' ').slice(1).join(' '),
          phone: meta?.phone,
          status: meta?.status || 'ACTIVE',
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: (meta?.role as Role) || 'ATHLETE',
          firstName: meta?.first_name || meta?.full_name?.split(' ')[0],
          lastName: meta?.last_name || meta?.full_name?.split(' ').slice(1).join(' '),
          phone: meta?.phone,
          status: meta?.status || 'ACTIVE',
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    router.refresh();
  }, [supabase.auth, router]);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
    router.push('/');
  }, [supabase.auth, router]);

  return { user, loading, signIn, signUp, signOut };
}
