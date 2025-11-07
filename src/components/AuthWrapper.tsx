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
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Poczekaj chwilę, aby upewnić się, że localStorage jest gotowy
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log('🔐 Session check:', { 
        hasSession: !!session, 
        userEmail: session?.user?.email,
        error: error?.message 
      });

      if (error) {
        console.error('❌ Session error:', error);
      }

      if (!session) {
        const redirectTo = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        console.log('🔐 No session, redirecting to login');
        window.location.href = `/login?redirect=${redirectTo}`;
        return;
      }

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

