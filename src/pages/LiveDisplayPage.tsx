import React, { useState, useEffect } from 'react';
import { LiveDisplay } from '@/components/LiveDisplay';
import { TargetManager } from '@/components/TargetManager';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { LiveParticipantCounter } from '@/components/LiveParticipantCounter';
import { FloatingReactions } from '@/components/FloatingReactions';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, RotateCcw, Users, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Rating {
  id: string;
  target_person: string;
  overall: number;
  presentation: number;
  content: number;
  feedback?: string;
  category: 'resume' | 'linkedin';
  agreement?: 'agree' | 'disagree' | null;
  reaction?: string;
  created_at: string;
}

interface Resume {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

const LiveDisplayPage = () => {
  console.log('LiveDisplayPage: Component is rendering');
  
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showResumeView, setShowResumeView] = useState(false);

  // Get the rating page URL for QR code
  const ratingPageUrl = `${window.location.origin}/rate`;

  useEffect(() => {
    console.log('LiveDisplayPage: Setting up subscriptions and fetching data');
    
    // Fetch initial data
    const fetchInitialData = async () => {
      // Get current target
      const { data: targetData } = await (supabase as any)
        .from('current_target')
        .select('target_person')
        .eq('id', 1)
        .single();
      
      console.log('LiveDisplayPage: Initial target fetched:', targetData?.target_person);
      setCurrentTarget(targetData?.target_person || null);

      // Get uploaded resumes
      try {
        const { data: resumesData, error: resumesError } = await (supabase as any)
          .from('resumes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (resumesError) {
          console.error('LiveDisplayPage: Error fetching resumes:', resumesError);
        } else {
          console.log('LiveDisplayPage: Resumes fetched successfully:', resumesData?.length || 0, resumesData);
          setResumes((resumesData as unknown as Resume[]) || []);
        }
      } catch (error) {
        console.error('LiveDisplayPage: Exception while fetching resumes:', error);
      }

      // Get ratings for current target (only real ratings, not quick reactions)
      if (targetData?.target_person) {
        const { data: ratingsData } = await (supabase as any)
          .from('ratings')
          .select('*')
          .eq('target_person', targetData.target_person)
          .not('overall', 'is', null)
          .order('created_at', { ascending: false });
        
        console.log('LiveDisplayPage: Initial ratings fetched:', ratingsData?.length || 0);
        setRatings((ratingsData || []) as Rating[]);
      }
    };

    fetchInitialData();

    // Subscribe to target changes
    const targetChannel = supabase
      .channel('target-changes-display')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'current_target'
        },
        async (payload) => {
          const newTarget = payload.new.target_person;
          console.log('LiveDisplayPage: Target changed to:', newTarget);
          setCurrentTarget(newTarget);
          
          // Fetch ratings for new target (only real ratings)
          if (newTarget) {
            const { data: ratingsData } = await (supabase as any)
              .from('ratings')
              .select('*')
              .eq('target_person', newTarget)
              .not('overall', 'is', null)
              .order('created_at', { ascending: false });
            
            console.log('LiveDisplayPage: New ratings fetched for target:', ratingsData?.length || 0);
            setRatings((ratingsData || []) as Rating[]);
          } else {
            setRatings([]);
          }
        }
      )
      .subscribe((status) => {
        console.log('LiveDisplayPage: Target subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('LiveDisplayPage: Successfully subscribed to target updates!');
        }
      });

    // Subscribe to new ratings
    const ratingsChannel = supabase
      .channel('ratings-changes-display')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings'
        },
        (payload) => {
          const newRating = payload.new as Rating;
          console.log('LiveDisplayPage: New rating received:', newRating);
          
          // Show real-time notification for new ratings
          if (newRating.target_person === currentTarget && newRating.overall !== null && newRating.overall > 0) {
            console.log('LiveDisplayPage: Adding rating to display');
            setRatings(prev => [newRating, ...prev]);
            
            // Show toast notification
            toast({
              title: "New Rating Received! ⭐",
              description: `${newRating.overall}/5 stars for ${newRating.category}`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('LiveDisplayPage: Ratings subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('LiveDisplayPage: Successfully subscribed to rating updates!');
        }
      });

    return () => {
      console.log('LiveDisplayPage: Cleaning up subscriptions');
      supabase.removeChannel(targetChannel);
      supabase.removeChannel(ratingsChannel);
    };
  }, [currentTarget]);

  const handleClearStats = async () => {
    console.log('LiveDisplayPage: handleClearStats called');
    console.log('LiveDisplayPage: Current target:', currentTarget);
    console.log('LiveDisplayPage: Current ratings count:', ratings.length);
    
    if (!currentTarget) {
      console.log('LiveDisplayPage: No current target to clear stats for');
      return;
    }
    
    try {
      console.log('LiveDisplayPage: Attempting to delete ratings for target:', currentTarget);
      
      // First, let's see what ratings exist
      const { data: existingRatings, error: fetchError } = await (supabase as any)
        .from('ratings')
        .select('*')
        .eq('target_person', currentTarget);
      
      console.log('LiveDisplayPage: Existing ratings in database:', existingRatings);
      if (fetchError) {
        console.error('LiveDisplayPage: Error fetching existing ratings:', fetchError);
      }
      
      // Now delete them
      const { data, error, count } = await (supabase as any)
        .from('ratings')
        .delete()
        .eq('target_person', currentTarget)
        .select();
      
      if (error) {
        console.error('LiveDisplayPage: Error clearing stats from database:', error);
        return;
      }
      
      console.log('LiveDisplayPage: Delete result - data:', data);
      console.log('LiveDisplayPage: Delete result - count:', count);
      
      // Clear local state
      setRatings([]);
      console.log('LiveDisplayPage: Local ratings state cleared');
    } catch (error) {
      console.error('LiveDisplayPage: Exception while clearing stats:', error);
    }
  };

  const handleSetTarget = async () => {
    if (!selectedResumeId) {
      console.log('LiveDisplayPage: No resume selected');
      return;
    }
    
    const resume = resumes.find(r => r.id === selectedResumeId);
    if (!resume) {
      console.log('LiveDisplayPage: Resume not found for ID:', selectedResumeId);
      return;
    }

    console.log('LiveDisplayPage: Setting target for resume:', resume.name);
    
    // Clear stats FIRST, before updating target to avoid race condition
    if (currentTarget) {
      await handleClearStats();
    }
    
    setSelectedResume(resume);
    setShowResumeView(true);
    
    // Update the current target in the database
    try {
      await (supabase as any)
        .from('current_target')
        .update({ target_person: resume.name })
        .eq('id', 1);
      console.log('LiveDisplayPage: Target updated in database');
    } catch (error) {
      console.error('LiveDisplayPage: Error updating target:', error);
    }
  };

  // Auto-show resume when one is selected and target is set
  useEffect(() => {
    if (selectedResume && currentTarget) {
      console.log('LiveDisplayPage: Auto-showing resume view for:', selectedResume.name);
      setShowResumeView(true);
    }
  }, [selectedResume, currentTarget]);

  // Transform ratings to match the LiveDisplay component's expected format
  const transformedRatings = ratings.map(rating => ({
    id: rating.id,
    overall: rating.overall,
    presentation: rating.presentation,
    content: rating.content,
    feedback: rating.feedback,
    category: rating.category,
    agreement: rating.agreement,
    reaction: rating.reaction,
    timestamp: rating.created_at
  }));

  if (showResumeView && selectedResume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="h-[calc(100vh-2rem)] max-w-[95vw] mx-auto">
          <ResizablePanelGroup direction="horizontal" className="border border-border/50 rounded-lg">
            {/* Resume Display Panel - 2/3 */}
            <ResizablePanel defaultSize={67} minSize={60}>
              <div className="h-full flex flex-col bg-card">
                <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-sm sm:text-lg font-semibold truncate">Currently Reviewing: {selectedResume.name}</h2>
                    <LiveParticipantCounter currentTarget={currentTarget} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearStats}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Clear Stats
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowResumeView(false)}
                    >
                      Back to Selection
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  {selectedResume.file_type === 'application/pdf' ? (
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(`https://kpufipcunkgfpxhnhxxl.supabase.co/storage/v1/object/public/resumes/${selectedResume.file_path}`)}&embedded=true`}
                      className="w-full h-full border-0 rounded"
                      title={selectedResume.name}
                      style={{ minHeight: '600px' }}
                    />
                  ) : (
                    <img
                      src={`https://kpufipcunkgfpxhnhxxl.supabase.co/storage/v1/object/public/resumes/${selectedResume.file_path}`}
                      alt={selectedResume.name}
                      className="w-full h-full object-contain rounded"
                    />
                  )}
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Live Ratings Panel with QR Code - 1/3 */}
            <ResizablePanel defaultSize={33} minSize={25}>
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border">
                  <QRCodeGenerator 
                    url={ratingPageUrl} 
                    title="Scan to Rate"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <LiveDisplay ratings={transformedRatings} />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        <FloatingReactions currentTarget={currentTarget} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-[90vw] mx-auto">
        <Card className="mb-6 border-2 border-neon-purple/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-neon-purple">Currently Reviewing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resumes.length === 0 ? (
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">No resumes found. Please upload resumes on the home page first.</p>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Resume to Review ({resumes.length} available)</label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a resume from uploaded files" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.name} ({resume.file_type === 'application/pdf' ? 'PDF' : 'Image'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button 
              onClick={handleSetTarget}
              disabled={!selectedResumeId || resumes.length === 0}
              className="w-full bg-neon-purple hover:bg-neon-purple/90"
            >
              {resumes.length === 0 ? 'No Resumes Available' : 'Start Review Session'}
            </Button>

            {currentTarget && (
              <div className="text-center p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                <Badge className="bg-neon-green text-primary-foreground mb-2">Currently Reviewing</Badge>
                <p className="font-medium text-neon-green">{currentTarget}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Display Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-center flex items-center gap-2">
              <Bell className="w-5 h-5 text-neon-pink" />
              Live Ratings Preview
            </CardTitle>
            {currentTarget && (
              <LiveParticipantCounter currentTarget={currentTarget} />
            )}
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <LiveDisplay ratings={transformedRatings} />
            </div>
          </CardContent>
        </Card>
      </div>
      <FloatingReactions currentTarget={currentTarget} />
    </div>
  );
};

export default LiveDisplayPage;