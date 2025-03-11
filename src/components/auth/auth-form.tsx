"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams?.get('redirect') || '/';

  const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
    if (event === 'SIGNED_IN' && session) {
      toast.success("Login successful");
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('supabase.auth.token', session.access_token);
      localStorage.setItem('supabase.user.id', session.user.id);
      
      // Ensure auth state is properly set before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace(redirect);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace(redirect);
      }
    };
    checkSession();
  }, [redirect]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    return () => subscription.unsubscribe();
  }, [redirect]);

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 max-w-[400px] mx-auto">
      <div className="w-full bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000000',
                  brandAccent: '#333333',
                },
              },
            },
            className: {
              container: 'w-full',
              button: 'w-full',
              input: 'w-full'
            }
          }}
          providers={[]}
          redirectTo={redirect}
        />
      </div>
    </div>
  );
}
