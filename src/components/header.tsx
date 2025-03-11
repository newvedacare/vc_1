"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ShoppingCart, Truck, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Header() {
  const { user } = useAuth();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="w-full bg-white border-b fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-semibold">
            Mukorossi
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/hair-care" className="text-gray-600 hover:text-gray-900">
              Hair Care
            </Link>
            <Link href="/pain-relief" className="text-gray-600 hover:text-gray-900">
              Pain Relief
            </Link>
            <Link href="/memory-booster" className="text-gray-600 hover:text-gray-900">
              Memory Booster
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <Truck className="h-6 w-6" />
            </button>
            <Link href="/cart" className="text-gray-600 hover:text-gray-900 relative">
              <ShoppingCart className="h-6 w-6" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <button
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('supabase.auth.token');
                    toast.success("Logged out successfully");
                    router.push('/');
                  } catch (error) {
                    console.error('Logout error:', error);
                    toast.error("Failed to log out. Please try again.");
                  }
                }}
                className="text-gray-600 hover:text-gray-900 text-sm hidden md:block"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 text-sm hidden md:block"
              >
                Sign in
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex flex-col space-y-1.5 p-2"
            >
              <span className={`block w-6 h-0.5 bg-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-600 transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <Transition
          show={isOpen}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
        <div className="fixed inset-0 bg-white z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="text-xl font-semibold">
                Mukorossi
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="space-y-6">
              <Link 
                href="/" 
                className="block text-lg font-medium text-gray-900 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/hair-care" 
                className="block text-lg font-medium text-gray-900 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                Hair Care
              </Link>
              <Link 
                href="/pain-relief" 
                className="block text-lg font-medium text-gray-900 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                Pain Relief
              </Link>
              <Link 
                href="/memory-booster" 
                className="block text-lg font-medium text-gray-900 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                Memory Booster
              </Link>
              <Link 
                href="/about" 
                className="block text-lg font-medium text-gray-900 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/login"
                className="block text-lg font-medium text-gray-900 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                Sign in
              </Link>
            </nav>
          </div>
        </div>
        </Transition>
      </div>
    </header>
  );
}
