import React from 'react';
import { QuickReactions } from '@/components/QuickReactions';
import { VotingForm } from '@/components/VotingForm';
import { MobileVotingForm } from '@/components/MobileVotingForm';
import { PersonalResumeUploader } from '@/components/PersonalResumeUploader';
import { QuickQuestionInput } from '@/components/QuickQuestionInput';
import { useIsMobile } from '@/hooks/use-mobile';

interface RatingData {
  overall: number;
  presentation: number;
  content: number;
  category: 'resume' | 'linkedin';
  agreement?: 'agree' | 'disagree';
  reaction?: string;
}

interface ParticipationFlowProps {
  currentTarget: string | null;
  onSubmitRating: (rating: RatingData) => Promise<void>;
}

export function ParticipationFlow({ currentTarget, onSubmitRating }: ParticipationFlowProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      {/* 1. Quick Reactions - First */}
      <QuickReactions />
      
      {/* 2. Cast Your Vote - Second (Mobile optimized) */}
      {isMobile ? (
        <MobileVotingForm onSubmit={onSubmitRating} currentTarget={currentTarget} />
      ) : (
        <VotingForm onSubmit={onSubmitRating} currentTarget={currentTarget} />
      )}
      
      {/* 3. Quick Question Input - Third */}
      <QuickQuestionInput currentTarget={currentTarget} />
      
      {/* 4. Upload Your Resume - Fourth */}
      <PersonalResumeUploader />
    </div>
  );
}