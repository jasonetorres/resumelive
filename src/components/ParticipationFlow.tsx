import React from 'react';
import { RatingInput } from '@/components/RatingInput';
import { ChatInput } from '@/components/ChatInput';

interface RatingData {
  overall: number;
  presentation: number;
  content: number;
  feedback?: string;
  category: 'resume' | 'linkedin';
  agreement?: 'agree' | 'disagree';
  reaction?: string;
}

interface ParticipationFlowProps {
  currentTarget: string | null;
  onSubmitRating: (rating: RatingData) => Promise<void>;
}

export function ParticipationFlow({ currentTarget, onSubmitRating }: ParticipationFlowProps) {
  return (
    <div className="space-y-6">
      {/* Rating Form with Quick Reactions - This contains both reactions and voting form */}
      <RatingInput onSubmit={onSubmitRating} currentTarget={currentTarget} />
      
      {/* Live Chat - After the rating form */}
      <ChatInput currentTarget={currentTarget} />
    </div>
  );
}