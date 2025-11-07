import { useEffect, useState } from 'react';
import FlashcardManager from './FlashcardManager';
import { supabase } from '../lib/supabase';

export default function FlashcardManagerWrapper() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, []);

  if (!userId) {
    return <div className="text-white">Ładowanie...</div>;
  }

  return <FlashcardManager userId={userId} />;
}

