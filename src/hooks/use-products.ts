"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Review {
  id: number;
  rating: number;
  product_id: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  image_url: string;
  category: string;
  rating: number;
  created_at: string | null;
  updated_at: string | null;
  averageRating?: number;
  totalReviews?: number;
  quantity?: number;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .order('created_at', { ascending: false });

        if (productsError) {
          toast.error("Failed to load products");
          throw productsError;
        }

        if (!productsData || productsData.length === 0) {
          toast.warning("No products found");
          setProducts([]);
          return;
        }

        // Transform the data to match the Product interface
        const transformedProducts: Product[] = productsData.map((product) => ({
          ...product,
          created_at: product.created_at || null,
          updated_at: product.updated_at || null,
          averageRating: product.rating || 4.5,
          totalReviews: 10
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Error loading products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return { products, loading };
}
