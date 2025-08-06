import React from 'react';
import { RatingInput } from '@/components/RatingInput';

// Mock function - replace with actual Supabase integration
const mockSubmitRating = async (rating: any) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Rating submitted:', rating);
};

const RateInputPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">
            Stream Feedback
          </h1>
          <p className="text-muted-foreground">
            Help improve content with your anonymous ratings!
          </p>
        </div>
        <RatingInput onSubmit={mockSubmitRating} />
      </div>
    </div>
  );
};

export default RateInputPage;