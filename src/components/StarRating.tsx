import React, { useState } from 'react';
import { Star } from 'phosphor-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
    lg: 'w-8 h-8 md:w-10 md:h-10',
    xl: 'w-16 h-16 md:w-20 md:h-20' // Triple the md size
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
    <div className={cn("flex gap-0.5 items-center justify-center", className)}>
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
              weight={isFilled ? "fill" : "regular"}
              className={cn(
                "transition-all duration-200",
                isFilled 
                  ? "text-neon-orange star-animation" 
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