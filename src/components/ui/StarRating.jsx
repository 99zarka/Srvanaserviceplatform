import React, { useState } from 'react';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (starIndex) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starIndex);
    }
  };

  const handleMouseEnter = (starIndex) => {
    if (!readonly) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const renderStar = (index) => {
    const isFilled = index <= (readonly ? rating : (hoverRating || rating));
    const isHalfStar = !readonly && 
      hoverRating === 0 && 
      rating >= index - 0.5 && 
      rating < index;

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleClick(index)}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        disabled={readonly}
        className={`${sizeClasses[size]} ${
          readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
        }`}
        aria-label={`Rate ${index} star${index > 1 ? 's' : ''}`}
      >
        <svg
          className={`w-full h-full ${
            isFilled 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
          viewBox="0 0 24 24"
        >
          {isHalfStar ? (
            <defs>
              <linearGradient id={`half-star-${index}`}>
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
          ) : null}
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={isHalfStar ? `url(#half-star-${index})` : undefined}
          />
        </svg>
      </button>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
};

export default StarRating;
