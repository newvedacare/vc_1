"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
};

import { toast } from "sonner";

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  updateProfile: async () => {},
  uploadAvatar: async () => ""
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      if (!user) throw new Error('No user');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;
      await updateProfile({ avatar_url: avatarUrl });
      
      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
      throw error;
    }
  };

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
    <AuthContext.Provider value={{ user, profile, loading, updateProfile, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
