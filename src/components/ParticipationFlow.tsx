import React from 'react';
import { QuickReactions } from '@/components/QuickReactions';
import { ChatInput } from '@/components/ChatInput';
import { VotingForm } from '@/components/VotingForm';

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
      {/* 1. Quick Reactions - First */}
      <QuickReactions />
      
      {/* 2. Live Chat - Second */}
      <ChatInput currentTarget={currentTarget} />
      
      {/* 3. Cast Your Vote - Third */}
      <VotingForm onSubmit={onSubmitRating} currentTarget={currentTarget} />
    </div>
  );
}