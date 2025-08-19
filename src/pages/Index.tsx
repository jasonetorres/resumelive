import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Star, Users, Monitor, Smartphone, Zap, TrendingUp, Upload } from 'lucide-react';
import { ResumeManager } from '@/components/ResumeManager';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/47be24da-2929-4836-b53c-587b774ca249.png" 
              alt="Stream Ratings Logo" 
              className="w-16 h-16"
            />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange bg-clip-text text-transparent">
              Resume Ratings
            </h1>
            <img 
              src="/lovable-uploads/47be24da-2929-4836-b53c-587b774ca249.png" 
              alt="Stream Ratings Logo" 
              className="w-16 h-16"
            />
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Feedback tool for resumes, live!
          </p>
          <div className="flex justify-center gap-2">
            <Badge className="bg-neon-purple text-primary-foreground">Live Streaming</Badge>
            <Badge className="bg-neon-cyan text-primary-foreground">Live Feedback</Badge>
            <Badge className="bg-neon-pink text-primary-foreground">Real-time</Badge>
          </div>
        </div>

        {/* Resume Upload Section */}
        <Card className="glow-effect border-neon-orange/50 hover:border-neon-orange transition-all duration-300 mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-neon-orange to-neon-pink rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-neon-orange">Upload Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center mb-4">
              Upload and manage your resumes for stream reviews
            </p>
            <ResumeManager className="max-w-4xl mx-auto" />
          </CardContent>
        </Card>

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="glow-effect border-neon-purple/50 hover:border-neon-purple transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-neon-purple">Rate Content</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Viewers use this page to submit live ratings for resumes and LinkedIn profiles
              </p>
              <div className="flex justify-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-neon-orange" />
                  5-Star Rating
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-neon-cyan" />
                  Live Feedback
                </span>
              </div>
              <Link to="/rate">
                <Button className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple text-primary-foreground glow-effect">
                  Open Rating Page
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glow-effect border-neon-cyan/50 hover:border-neon-cyan transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-neon-cyan to-neon-green rounded-full flex items-center justify-center">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-neon-cyan">Stream Display</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Real-time display for your stream overlay showing live ratings and feedback
              </p>
              <div className="flex justify-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-neon-green" />
                  Live Updates
                </span>
                <span className="flex items-center gap-1">
                  <Monitor className="w-4 h-4 text-neon-pink" />
                  Stream Ready
                </span>
              </div>
              <Link to="/display">
                <Button className="w-full bg-gradient-to-r from-neon-cyan to-neon-green hover:from-neon-green hover:to-neon-cyan text-primary-foreground glow-effect">
                  Open Display
                  <Monitor className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/formdisplay">
                <Button variant="outline" className="w-full mt-2">
                  Conference Leads Dashboard
                  <Users className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="border-neon-pink/30 bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-neon-pink">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-neon-purple rounded-full flex items-center justify-center mx-auto text-white font-bold">1</div>
                <h3 className="font-semibold">Share the Rate Link</h3>
                <p className="text-sm text-muted-foreground">Give your viewers the /rate page URL</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-neon-cyan rounded-full flex items-center justify-center mx-auto text-white font-bold">2</div>
                <h3 className="font-semibold">Open Display</h3>
                <p className="text-sm text-muted-foreground">Use /display as your stream overlay</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-neon-pink rounded-full flex items-center justify-center mx-auto text-white font-bold">3</div>
                <h3 className="font-semibold">Get Live Feedback</h3>
                <p className="text-sm text-muted-foreground">Watch ratings appear in real-time!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
