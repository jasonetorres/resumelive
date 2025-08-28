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
import { Link } from "react-router-dom";
import { Home, Monitor, Star, Users, Calendar, Database, ExternalLink } from "lucide-react";

const HostPage = () => {
  const { toast } = useToast();
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Debug logging
  console.log('HostPage: Component mounted');
  console.log('HostPage: isAuthenticated =', isAuthenticated);
  console.log('HostPage: passwordInput =', passwordInput);

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
    console.log('HostPage: Rendering password form');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-center text-primary">Host Access</CardTitle>
            <CardDescription className="text-center">Enter password to access host controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">Enter Password</label>
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
              className="w-full"
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

        {/* Navigation Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Quick Navigation
            </CardTitle>
            <CardDescription>
              Access all pages of the site from here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Link to="/">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Home className="h-5 w-5" />
                  <span className="text-xs">Home</span>
                </Button>
              </Link>
              
              <Link to="/live-display">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Monitor className="h-5 w-5" />
                  <span className="text-xs">Live Display</span>
                </Button>
              </Link>
              
              <Link to="/rate">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Star className="h-5 w-5" />
                  <span className="text-xs">Rate Input</span>
                </Button>
              </Link>
              
              <Link to="/lead-form">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Lead Form</span>
                </Button>
              </Link>
              
              <Link to="/schedule">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">Schedule</span>
                </Button>
              </Link>
              
              <Link to="/formdisplay">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Database className="h-5 w-5" />
                  <span className="text-xs">Dashboard</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostPage;