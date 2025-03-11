"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useAddresses, type Address } from "@/hooks/use-addresses";
import { supabase } from "@/lib/supabase";

export default function AddressPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false
  });

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const authToken = localStorage.getItem('supabase.auth.token');
      
      if (!isAuthenticated || !authToken) {
        router.replace('/login?redirect=/checkout/address');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('supabase.auth.token');
        toast.error("Session expired. Please log in again");
        router.replace('/login?redirect=/checkout/address');
        return;
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        name: editingAddress.name,
        address_line: editingAddress.address_line,
        city: editingAddress.city,
        state: editingAddress.state,
        postal_code: editingAddress.postal_code,
        is_default: editingAddress.is_default
      });
    }
  }, [editingAddress]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
      } else {
        await addAddress(formData);
      }
      setShowNewAddressForm(false);
      setEditingAddress(null);
      setFormData({
        name: "",
        address_line: "",
        city: "",
        state: "",
        postal_code: "",
        is_default: false
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    router.push(`/checkout/payment?address=${addressId}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(id);
    }
  };

  const handleEdit = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(address);
    setShowNewAddressForm(true);
  };

  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await setDefaultAddress(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold">Select Delivery Address</h1>
        </div>

        {!showNewAddressForm ? (
          <>
            <div className="space-y-4 mb-6">
              {addresses.map((address) => (
                <div 
                  key={address.id}
                  onClick={() => handleAddressSelect(address.id)}
                  className="p-4 border rounded-lg cursor-pointer hover:border-gray-400 transition-colors relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{address.name}</div>
                      <div className="text-gray-600 text-sm mt-1">
                        {address.address_line}, {address.city}, {address.state} {address.postal_code}
                      </div>
                      {address.is_default && (
                        <div className="text-blue-600 text-sm mt-2 flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current" />
                          Default Address
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!address.is_default && (
                        <button
                          onClick={(e) => handleSetDefault(address.id, e)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleEdit(address, e)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(address.id, e)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setEditingAddress(null);
                setFormData({
                  name: "",
                  address_line: "",
                  city: "",
                  state: "",
                  postal_code: "",
                  is_default: false
                });
                setShowNewAddressForm(true);
              }}
              className="w-full p-4 border-2 border-dashed rounded-lg text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Address
            </button>
          </>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line
              </label>
              <input
                type="text"
                required
                value={formData.address_line}
                onChange={(e) => setFormData(prev => ({ ...prev, address_line: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                required
                value={formData.postal_code}
                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                pattern="[0-9]*"
                maxLength={6}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowNewAddressForm(false);
                  setEditingAddress(null);
                }}
                className="flex-1 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors"
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
