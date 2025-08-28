import React, { useState, useEffect } from 'react';
import { LiveDisplay } from '@/components/LiveDisplay';
import { TargetManager } from '@/components/TargetManager';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { LiveParticipantCounter } from '@/components/LiveParticipantCounter';
import { FloatingReactions } from '@/components/FloatingReactions';
import { FloatingChatMessages } from '@/components/FloatingChatMessages';
import { FloatingFeedback } from '@/components/FloatingFeedback';
import { FloatingQuestions } from '@/components/FloatingQuestions';
import { FloatingSounds } from '@/components/FloatingSounds';
import { LiveChat } from '@/components/LiveChat';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, RotateCcw, Users, Bell, MessageSquare } from 'lucide-react';
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
  console.log('LiveDisplayPage: Component starting to render');
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showResumeView, setShowResumeView] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Get the rating page URL for QR code - now points to registration form
  const ratingPageUrl = `${window.location.origin}/register`;

  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      // Get current target
      const { data: targetData } = await (supabase as any)
        .from('current_target')
        .select('target_person')
        .eq('id', 1)
        .maybeSingle();
      
      setCurrentTarget(targetData?.target_person || null);

      // Get uploaded resumes
      try {
        const { data: resumesData, error: resumesError } = await (supabase as any)
          .from('resumes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (resumesError) {
          console.error('Error fetching resumes:', resumesError);
        } else {
          setResumes((resumesData as unknown as Resume[]) || []);
        }
      } catch (error) {
        console.error('Exception while fetching resumes:', error);
      }

      // Get ratings for current target (only real ratings, not quick reactions)
      if (targetData?.target_person) {
        const { data: ratingsData } = await (supabase as any)
          .from('ratings')
          .select('*')
          .eq('target_person', targetData.target_person)
          .not('overall', 'is', null)
          .order('created_at', { ascending: false });
        
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
          setCurrentTarget(newTarget);
          
          // Fetch ratings for new target (only real ratings)
          if (newTarget) {
            const { data: ratingsData } = await (supabase as any)
              .from('ratings')
              .select('*')
              .eq('target_person', newTarget)
              .not('overall', 'is', null)
              .order('created_at', { ascending: false });
            
            setRatings((ratingsData || []) as Rating[]);
          } else {
            setRatings([]);
          }
        }
      )
      .subscribe();

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
          
          // Show real-time notification for new ratings
          if (newRating.target_person === currentTarget && newRating.overall !== null && newRating.overall > 0) {
            setRatings(prev => [newRating, ...prev]);
            
            // Show toast notification
            toast({
              title: "New Rating Received! ⭐",
              description: `${newRating.overall}/5 stars for ${newRating.category}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(targetChannel);
      supabase.removeChannel(ratingsChannel);
    };
  }, [currentTarget]);

  const handleClearStats = async () => {
    if (!currentTarget) {
      return;
    }
    
    try {
      // First, let's see what ratings exist
      const { data: existingRatings, error: fetchError } = await (supabase as any)
        .from('ratings')
        .select('*')
        .eq('target_person', currentTarget);
      
      if (fetchError) {
        console.error('Error fetching existing ratings:', fetchError);
      }
      
      // Now delete them
      const { data, error, count } = await (supabase as any)
        .from('ratings')
        .delete()
        .eq('target_person', currentTarget)
        .select();
      
      if (error) {
        console.error('Error clearing stats from database:', error);
        return;
      }
      
      // Clear local state
      setRatings([]);
    } catch (error) {
      console.error('Exception while clearing stats:', error);
    }
  };

  const handleResetScores = async () => {
    if (!currentTarget) {
      return;
    }
    
    try {
      // Only delete ratings (scores), not chat messages
      const { error } = await (supabase as any)
        .from('ratings')
        .delete()
        .eq('target_person', currentTarget);
      
      if (error) {
        console.error('Error resetting scores:', error);
        return;
      }
      
      // Clear local ratings state but keep chat
      setRatings([]);
      
      toast({
        title: "Scores Reset! 🔄",
        description: "All ratings have been cleared. Chat history is preserved.",
      });
    } catch (error) {
      console.error('Exception while resetting scores:', error);
    }
  };

  const handleClearChat = async () => {
    try {
      // Delete ALL chat messages (not just for current target)
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows by using a condition that's always true
      
      if (error) {
        console.error('Error clearing chat:', error);
        toast({
          title: "Error",
          description: "Failed to clear chat messages.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('All chat messages cleared successfully');
      toast({
        title: "Chat Cleared! 💬",
        description: "All chat messages have been cleared.",
      });
    } catch (error) {
      console.error('Exception while clearing chat:', error);
      toast({
        title: "Error",
        description: "An error occurred while clearing chat.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === 'torcresumes') {
      setIsAuthenticated(true);
      setPasswordInput('');
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password",
        variant: "destructive"
      });
    }
  };

  const handleSetTarget = async () => {
    if (!selectedResumeId) {
      return;
    }
    
    const resume = resumes.find(r => r.id === selectedResumeId);
    if (!resume) {
      return;
    }
    
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
    } catch (error) {
      console.error('Error updating target:', error);
    }
  };

  // Auto-show resume when one is selected and target is set
  useEffect(() => {
    if (selectedResume && currentTarget) {
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

  // Password protection check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-neon-purple/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-neon-purple">Display Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Enter Password</label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter display password"
                className="w-full"
              />
            </div>
            <Button 
              onClick={handlePasswordSubmit}
              className="w-full bg-neon-purple hover:bg-neon-purple/90"
            >
              Access Display
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResumeView && selectedResume) {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col overflow-hidden">
        {/* Compact Header */}
        <div className="p-3 border-b border-border bg-card/50 backdrop-blur flex-shrink-0">
          <div className="max-w-full mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-neon-purple">Conference Resume Review</h1>
              <LiveParticipantCounter currentTarget={currentTarget} />
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetScores}
                className="border-neon-orange text-neon-orange hover:bg-neon-orange/10"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset Scores
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearChat}
                className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Clear Chat
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearStats}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear All
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
        </div>

        {/* Main Content Area - Full Height */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Resume Display Panel - Left Side */}
            <ResizablePanel defaultSize={70} minSize={60}>
              <div className="h-full flex flex-col bg-card">
                <div className="p-3 border-b border-border bg-card/80 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-center">Currently Reviewing: {selectedResume.name}</h2>
                </div>
                <div className="flex-1 p-4 overflow-hidden">
                  {selectedResume.file_type === 'application/pdf' ? (
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(`https://kotkjuhregqhczxhsynd.supabase.co/storage/v1/object/public/resumes/${selectedResume.file_path}`)}&embedded=true`}
                      className="w-full h-full border-0 rounded"
                      title={selectedResume.name}
                    />
                  ) : (
                    <img
                      src={`https://kotkjuhregqhczxhsynd.supabase.co/storage/v1/object/public/resumes/${selectedResume.file_path}`}
                      alt={selectedResume.name}
                      className="w-full h-full object-contain rounded"
                    />
                  )}
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Live Ratings Panel - Right Side */}
            <ResizablePanel defaultSize={30} minSize={25}>
              <div className="h-full flex flex-col bg-card">
                {/* QR Code Section */}
                <div className="p-3 border-b border-border bg-card/80 flex-shrink-0">
                  <QRCodeGenerator 
                    url={ratingPageUrl} 
                    title="Scan to Register & Rate"
                    size={100}
                  />
                </div>
                
                {/* Split between Live Ratings and Chat */}
                <div className="flex-1 overflow-hidden">
                  <ResizablePanelGroup direction="vertical" className="h-full">
                    {/* Live Ratings */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full flex flex-col">
                        <div className="p-3 border-b border-border bg-card/80 flex-shrink-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Bell className="w-4 h-4 text-neon-pink" />
                              Live Ratings ({transformedRatings.length})
                            </h3>
                            <Badge variant="outline" className="text-xs">Real-time</Badge>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                          <LiveDisplay ratings={transformedRatings} />
                        </div>
                      </div>
                    </ResizablePanel>
                    
                    <ResizableHandle withHandle />
                    
                    {/* Live Chat */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <LiveChat currentTarget={currentTarget} viewOnly={true} />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        <FloatingReactions currentTarget={currentTarget} />
        <FloatingQuestions currentTarget={currentTarget} />
        <FloatingFeedback currentTarget={currentTarget} />
        <FloatingSounds />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-[90vw] mx-auto">
        <Card className="mb-6 border-2 border-neon-purple/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-neon-purple">Conference Resume Review Setup</CardTitle>
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
              {resumes.length === 0 ? 'No Resumes Available' : 'Start Conference Display'}
            </Button>

            {currentTarget && (
              <div className="text-center p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                <Badge className="bg-neon-green text-primary-foreground mb-2">Currently Reviewing</Badge>
                <p className="font-medium text-neon-green">{currentTarget}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This will be displayed on the conference monitor
                </p>
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
      <FloatingQuestions currentTarget={currentTarget} />
      <FloatingFeedback currentTarget={currentTarget} />
    </div>
  );
};

export default LiveDisplayPage;