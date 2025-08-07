import React, { useState, useEffect } from 'react';
import { RatingInput } from '@/components/RatingInput';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RatingData {
  overall: number;
  presentation: number;
  content: number;
  feedback?: string;
  category: 'resume' | 'linkedin';
  agreement?: 'agree' | 'disagree';
}

const RateInputPage = () => {
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch current target
    const fetchCurrentTarget = async () => {
      const { data } = await supabase
        .from('current_target')
        .select('target_person')
        .eq('id', 1)
        .single();
      
      setCurrentTarget(data?.target_person || null);
    };

    fetchCurrentTarget();

    // Subscribe to target changes
    const channel = supabase
      .channel('target-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'current_target'
        },
        (payload) => {
          setCurrentTarget(payload.new.target_person);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmitRating = async (rating: RatingData) => {
    if (!currentTarget) {
      toast({
        title: "No Target Set",
        description: "Please wait for a target to be set before submitting ratings.",
        variant: "destructive",
      });
      throw new Error('No target set');
    }

    const { error } = await supabase
      .from('ratings')
      .insert({
        target_person: currentTarget,
        overall: rating.overall,
        presentation: rating.presentation,
        content: rating.content,
        feedback: rating.feedback,
        category: rating.category,
        agreement: rating.agreement,
      });

    if (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">
            User Vote 🗳️
          </h1>
          {currentTarget ? (
            <div>
              <p className="text-muted-foreground mb-2">
                Rate the content for
              </p>
              <p className="text-2xl font-bold text-neon-green">
                {currentTarget}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Waiting for target to be set...
            </p>
          )}
        </div>
        {currentTarget ? (
          <RatingInput onSubmit={handleSubmitRating} />
        ) : (
          <div className="text-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <p className="text-muted-foreground">
              No active rating session
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RateInputPage;