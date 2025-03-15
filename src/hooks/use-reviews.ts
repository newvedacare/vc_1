"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export interface Review {
  id: string;
  user_id: string;
  product_id: number;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
}

export function useReviews(productId?: number) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const { user } = useAuth();

  const loadReviews = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data);

      // Find user's review if they're logged in
      if (user) {
        const userReview = data.find(review => review.user_id === user.id);
        setUserReview(userReview || null);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (rating: number, reviewText: string) => {
    try {
      if (!user) {
        toast.error('Please log in to submit a review');
        return false;
      }

      if (!productId) {
        toast.error('Invalid product');
        return false;
      }

      const review = {
        user_id: user.id,
        product_id: productId,
        rating,
        review_text: reviewText
      };

      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update(review)
          .eq('id', userReview.id);

        if (error) throw error;
        toast.success('Review updated successfully');
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert([review]);

        if (error) throw error;
        toast.success('Review submitted successfully');
      }

      // Reload reviews to get updated data
      await loadReviews();
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
      return false;
    }
  };

  const deleteReview = async () => {
    try {
      if (!user || !userReview) {
        toast.error('No review to delete');
        return false;
      }

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', userReview.id);

      if (error) throw error;

      setUserReview(null);
      await loadReviews();
      toast.success('Review deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
      return false;
    }
  };

  return {
    reviews,
    userReview,
    loading,
    loadReviews,
    submitReview,
    deleteReview
  };
}
