import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Soundboard } from "@/components/Soundboard";
import { ResumeController } from "@/components/ResumeController";
import { DisplayController } from "@/components/DisplayController";
import { HostQuestionControls } from "@/components/HostQuestionControls";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HostPage = () => {
  const { toast } = useToast();
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

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
      setPasswordInput('');
    }
  };

  // Fetch current target for question management
  useEffect(() => {
    const fetchCurrentTarget = async () => {
      const { data, error } = await supabase
        .from('current_target')
        .select('target_person')
        .eq('id', 1)
        .single();

      if (!error && data) {
        setCurrentTarget(data.target_person);
      }
    };

    fetchCurrentTarget();

    // Subscribe to target changes
    const channel = supabase
      .channel('host-target-changes')
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

  // Password protection check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-neon-purple/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-neon-purple">Host Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Enter Password</label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter host password"
                className="w-full"
              />
            </div>
            <Button 
              onClick={handlePasswordSubmit}
              className="w-full bg-neon-purple hover:bg-neon-purple/90"
            >
              Access Host Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Host Control Panel
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage sounds, resumes, and display controls in real-time
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🎵 Soundboard</CardTitle>
              <CardDescription>
                Play sounds that appear on the live display
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Soundboard />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📄 Resume Control</CardTitle>
              <CardDescription>
                Change the current resume being displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeController />
            </CardContent>
          </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>🎛️ Display Controls</CardTitle>
              <CardDescription>
                Clear ratings, reactions, and manage the display
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DisplayController />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>❓ Question Management</CardTitle>
            <CardDescription>
              Manage questions and control display visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HostQuestionControls currentTarget={currentTarget} />
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default HostPage;