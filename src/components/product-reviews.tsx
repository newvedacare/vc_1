"use client";

import { useState, useEffect } from "react";
import { useReviews, type Review } from "@/hooks/use-reviews";
import { StarRating } from "./star-rating";
import { Star, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";

interface ProductReviewsProps {
  productId: number;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { reviews, userReview, loading, loadReviews, submitReview, deleteReview } = useReviews(productId);
  const [rating, setRating] = useState(userReview?.rating ?? 5);
  const [reviewText, setReviewText] = useState(userReview?.review_text ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();
  }, [productId]);

  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setReviewText(userReview.review_text);
    }
  }, [userReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      return;
    }
    
    const success = await submitReview(rating, reviewText);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      await deleteReview();
      setRating(5);
      setReviewText("");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-100 rounded"></div>
        <div className="h-24 bg-gray-100 rounded"></div>
        <div className="h-24 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">
            {reviews.length > 0 
              ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
              : "0.0"}
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {[1,2,3,4,5].map((star) => (
                <Star 
                  key={star}
                  className={`w-5 h-5 ${
                    star <= (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {(user && (isEditing || !userReview)) && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-6 space-y-4">
          <h3 className="font-medium">Write a Review</h3>
          <div>
            <div className="text-sm text-gray-600 mb-2">Rating</div>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`w-6 h-6 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Review</div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full border rounded-lg p-3 min-h-[100px]"
              placeholder="Write your review here..."
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {userReview ? "Update Review" : "Submit Review"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-gray-600 text-sm">
                  {format(new Date(review.created_at), 'PP')}
                </div>
              </div>
              {user?.id === review.user_id && !isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 hover:bg-gray-100 rounded text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4">
              {review.review_text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
