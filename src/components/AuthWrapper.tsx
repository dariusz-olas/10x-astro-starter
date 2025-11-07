import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuth();

    // Nasłuchuj zmian w sesji
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔐 Auth state changed:', _event, session?.user?.email || 'no session');
      if (session) {
        setUser(session.user);
        setLoading(false);
      } else {
        setUser(null);
        // Nie ustawiaj loading na false od razu - poczekaj na checkAuth
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Sprawdź localStorage przed sprawdzeniem sesji
      if (typeof window !== 'undefined') {
        const storedSession = localStorage.getItem('supabase.auth.token');
        console.log('🔐 localStorage check:', {
          hasStoredSession: !!storedSession,
          storedSessionLength: storedSession?.length || 0
        });
      }

      // Poczekaj dłużej, aby upewnić się, że localStorage jest gotowy i sesja jest zapisana
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log('🔐 Session check:', { 
        hasSession: !!session, 
        userEmail: session?.user?.email,
        error: error?.message,
        sessionExpiresAt: session?.expires_at
      });

      if (error) {
        console.error('❌ Session error:', error);
      }

      if (!session) {
        // Sprawdź jeszcze raz localStorage
        if (typeof window !== 'undefined') {
          const storedSession = localStorage.getItem('supabase.auth.token');
          console.log('🔐 No session found, localStorage:', {
            hasStoredSession: !!storedSession,
            storedSessionLength: storedSession?.length || 0
          });
        }
        
        const redirectTo = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        console.log('🔐 No session, redirecting to login');
        window.location.href = `/login?redirect=${redirectTo}`;
        return;
      }

      console.log('🔐 Session found, setting user');
      setUser(session.user);
    } catch (error) {
      console.error('❌ Auth error:', error);
      const redirectTo = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?redirect=${redirectTo}`;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-lg">Ładowanie...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect już nastąpił
  }

  return <>{children}</>;
}

