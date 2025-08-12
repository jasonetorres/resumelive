import React, { useState, useEffect } from 'react';
import { LeadForm } from '@/components/LeadForm';
import RateInputPage from './RateInput';

const LeadGatedRate = () => {
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already submitted lead data in this session
    const leadData = sessionStorage.getItem('leadData');
    if (leadData) {
      setHasSubmittedLead(true);
    }
    setIsLoading(false);
  }, []);

  const handleLeadSuccess = () => {
    setHasSubmittedLead(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasSubmittedLead) {
    return <LeadForm onSuccess={handleLeadSuccess} />;
  }

  return <RateInputPage />;
};

export default LeadGatedRate;