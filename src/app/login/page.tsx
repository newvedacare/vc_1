"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { Suspense } from "react";

function LoginContent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
