"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams?.get('redirect') || '/';

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
    if (event === 'SIGNED_IN' && session) {
      try {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            updated_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        // Upload avatar if selected
        if (avatarFile) {
          setUploading(true);
          const fileExt = avatarFile.name.split('.').pop();
          const filePath = `${session.user.id}/avatar.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });

          if (uploadError) throw uploadError;

          // Update profile with avatar URL
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              avatar_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`
            })
            .eq('id', session.user.id);

          if (updateError) throw updateError;
        }

        toast.success("Login successful");
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('supabase.auth.token', session.access_token);
        localStorage.setItem('supabase.user.id', session.user.id);
        
        // Ensure auth state is properly set before redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        router.replace(redirect);
      } catch (error) {
        console.error('Profile creation error:', error);
        toast.error("Failed to create profile");
      } finally {
        setUploading(false);
      }
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
        {!uploading && (
          <div className="mb-6">
            <label className="block w-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />
              <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2 text-sm text-gray-600">
                    {avatarFile ? avatarFile.name : 'Upload profile picture (optional)'}
                  </div>
                </div>
              </div>
            </label>
          </div>
        )}
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
