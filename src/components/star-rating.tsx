"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  totalReviews: number;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ rating, totalReviews, size = "sm" }: StarRatingProps) {
  const starSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSizes[size]} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-gray-600 text-sm ml-2">
        ({rating.toFixed(1)} • {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
