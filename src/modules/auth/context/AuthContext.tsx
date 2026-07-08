'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { getSupabaseBrowserClient } from '@/shared/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode; 
  initialUser: AuthUser | null;
}) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    setIsLoading(false);
    setCurrentUser(initialUser);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        router.push('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialUser, supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
