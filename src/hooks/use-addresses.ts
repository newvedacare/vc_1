"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export interface Address {
  id: string;
  user_id: string;
  name: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadAddresses = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      
      // Convert database types to Address interface
      const convertedAddresses: Address[] = (data || []).map(addr => ({
        ...addr,
        id: addr.id.toString()
      }));
      
      setAddresses(convertedAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...address,
          user_id: user.id,
          is_default: addresses.length === 0
        })
        .select()
        .single();

      if (error) throw error;

      const convertedAddress: Address = {
        ...data,
        id: data.id.toString()
      };
      setAddresses(prev => [...prev, convertedAddress]);
      toast.success("Address added successfully");
      return data;
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error("Failed to add address");
      throw error;
    }
  };

  const updateAddress = async (id: string, updates: Omit<Partial<Address>, 'id' | 'user_id'>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('addresses')
        .update({
          name: updates.name,
          address_line: updates.address_line,
          city: updates.city,
          state: updates.state,
          postal_code: updates.postal_code,
          is_default: updates.is_default
        })
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const convertedAddress: Address = {
        ...data,
        id: data.id.toString()
      };
      setAddresses(prev => prev.map(addr => addr.id === id ? convertedAddress : addr));
      toast.success("Address updated successfully");
      return convertedAddress;
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error("Failed to update address");
      throw error;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', parseInt(id))
        .eq('user_id', user.id);

      if (error) throw error;

      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toast.success("Address deleted successfully");
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error("Failed to delete address");
      throw error;
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // First, remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the new default
      const { data, error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => prev.map(addr => ({
        ...addr,
        is_default: addr.id === id
      })));

      toast.success("Default address updated");
      return data;
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error("Failed to update default address");
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  return {
    addresses,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    loadAddresses
  };
}
