import React, { useState, useEffect } from 'react';
import { LiveDisplay } from '@/components/LiveDisplay';
import { TargetManager } from '@/components/TargetManager';
import { FloatingReactions } from '@/components/FloatingReactions';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showResumeView, setShowResumeView] = useState(false);

  useEffect(() => {
    console.log('LiveDisplayPage: Setting up subscriptions and fetching data');
    
    // Fetch initial data
    const fetchInitialData = async () => {
      // Get current target
      const { data: targetData } = await supabase
        .from('current_target')
        .select('target_person')
        .eq('id', 1)
        .single();
      
      console.log('LiveDisplayPage: Initial target fetched:', targetData?.target_person);
      setCurrentTarget(targetData?.target_person || null);

      // Get uploaded resumes
      try {
        const { data: resumesData, error: resumesError } = await supabase
          .from('resumes' as any)
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
        const { data: ratingsData } = await supabase
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
            const { data: ratingsData } = await supabase
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
          // Only add if it's for the current target AND it's a real rating (not a quick reaction)
          if (newRating.target_person === currentTarget && newRating.overall !== null && newRating.overall > 0) {
            console.log('LiveDisplayPage: Adding rating to display');
            setRatings(prev => [newRating, ...prev]);
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
    setSelectedResume(resume);
    // Automatically show the resume view when a target is set via resume selection
    setShowResumeView(true);
    
    // Update the current target in the database
    try {
      await supabase
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
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Currently Reviewing: {selectedResume.name}</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowResumeView(false)}
                  >
                    Back to Selection
                  </Button>
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
            
            {/* Live Ratings Panel - 1/3 */}
            <ResizablePanel defaultSize={33} minSize={25}>
              <div className="h-full overflow-auto">
                <LiveDisplay ratings={transformedRatings} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
          
          {/* Global floating reactions */}
          <FloatingReactions currentTarget={currentTarget} />
        </div>
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
          <CardHeader>
            <CardTitle className="text-center">Live Ratings Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-auto">
              <LiveDisplay ratings={transformedRatings} />
            </div>
          </CardContent>
        </Card>
        
        {/* Global floating reactions */}
        <FloatingReactions currentTarget={currentTarget} />
      </div>
    </div>
  );
};

export default LiveDisplayPage;