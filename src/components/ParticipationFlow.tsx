import React, { useState } from 'react';
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
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);

  const handleATSAnalysis = (analysis: any) => {
    setAtsAnalysis(analysis);
  };

  const handleSubmitWithATS = async (rating: RatingData) => {
    const ratingWithATS = {
      ...rating,
      atsScore: atsAnalysis?.score,
      atsFormattingScore: atsAnalysis?.formattingScore,
      atsSkills: atsAnalysis?.skillsExtracted,
      atsKeywords: atsAnalysis?.keywordsFound,
    };
    await onSubmitRating(ratingWithATS as any);
  };
  
  return (
    <div className="space-y-6">
      {/* 1. Upload Your Resume - First */}
      <PersonalResumeUploader onATSAnalysisComplete={handleATSAnalysis} />
      
      {/* 2. Quick Reactions - Second */}
      <QuickReactions />
      
      {/* 3. Cast Your Vote - Third (Mobile optimized) */}
      {isMobile ? (
        <MobileVotingForm onSubmit={handleSubmitWithATS} currentTarget={currentTarget} />
      ) : (
        <VotingForm onSubmit={handleSubmitWithATS} currentTarget={currentTarget} />
      )}
      
      {/* 4. Quick Question Input - Fourth */}
      <QuickQuestionInput currentTarget={currentTarget} />
    </div>
  );
}