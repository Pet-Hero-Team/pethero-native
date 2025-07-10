import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState({ user: session?.user ?? null, session });
      setLoading(false);
    });

    checkUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      setAuthState({ user: userData.user, session: sessionData.session });
    } catch (error) {
      console.error("Error checking user:", (error as Error).message);
      setAuthState({ user: null, session: null });
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAuthState({ user: null, session: null });
    } catch (error) {
      console.error("Error signing out:", (error as Error).message);
      throw error;
    }
  }

  return {
    user: authState.user,
    session: authState.session,
    loading,
    signOut,
  };
}
