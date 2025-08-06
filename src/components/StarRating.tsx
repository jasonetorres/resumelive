import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarRating({ 
  value = 0, 
  onChange, 
  readonly = false, 
  size = 'md', 
  className 
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  return (
    <div className={cn("flex gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue || value) >= star;
        return (
          <button
            key={star}
            type="button"
            className={cn(
              "transition-all duration-200",
              sizeClasses[size],
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
          >
            <Star
              className={cn(
                "transition-all duration-200",
                isFilled 
                  ? "fill-neon-orange text-neon-orange star-animation" 
                  : "text-muted-foreground hover:text-neon-orange",
                !readonly && "hover:drop-shadow-[0_0_8px_hsl(var(--neon-orange))]"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}