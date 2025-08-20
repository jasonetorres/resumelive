import React from 'react';
import { QuickReactions } from '@/components/QuickReactions';
import { ChatInput } from '@/components/ChatInput';
import { VotingForm } from '@/components/VotingForm';
import { MobileVotingForm } from '@/components/MobileVotingForm';
import { PersonalResumeUploader } from '@/components/PersonalResumeUploader';
import { QASection } from '@/components/QASection';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      {/* 1. Quick Reactions - First */}
      <QuickReactions />
      
      {/* 2. Live Chat - Second */}
      <ChatInput currentTarget={currentTarget} />
      
      {/* 3. Cast Your Vote - Third (Mobile optimized) */}
      {isMobile ? (
        <MobileVotingForm onSubmit={onSubmitRating} currentTarget={currentTarget} />
      ) : (
        <VotingForm onSubmit={onSubmitRating} currentTarget={currentTarget} />
      )}
      
      {/* 4. Q&A Section - Fourth */}
      <QASection currentTarget={currentTarget} />
      
      {/* 5. Upload Your Resume - Fifth */}
      <PersonalResumeUploader />
    </div>
  );
}