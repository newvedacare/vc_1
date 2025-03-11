"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('supabase.auth.token', session.access_token);
            localStorage.setItem('supabase.user.id', session.user.id);
          } else {
            setUser(null);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('supabase.user.id');
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth on mount
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('supabase.auth.token', session.access_token);
          localStorage.setItem('supabase.user.id', session.user.id);
        } else {
          setUser(null);
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('supabase.user.id');
        }
        setLoading(false);
      }
    });

    // Check for existing session on page load
    const checkExistingSession = async () => {
      const token = localStorage.getItem('supabase.auth.token');
      if (token && !user) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user && !error) {
          setUser(session.user);
        }
      }
    };
    checkExistingSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
