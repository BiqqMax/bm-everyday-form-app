'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Button from '../ui/Button';
import { getBrowserSupabaseClient } from '../../lib/supabase/browser';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    router.replace('/login');
    router.refresh();
  }

  return (
    <Button type="button" variant="secondary" onClick={handleLogout} disabled={isSigningOut} aria-busy={isSigningOut}>
      {isSigningOut ? 'Signing out...' : 'Log out'}
    </Button>
  );
}
