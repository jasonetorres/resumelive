import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Star, Users, Monitor, DeviceMobile, Lightning, TrendUp, Upload } from 'phosphor-react';
import { ResumeManager } from '@/components/ResumeManager';
import { RealtimeTest } from '@/components/RealtimeTest';

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
        </div>

        {/* Resume Upload Section */}
        <Card className="glow-effect border-neon-orange/50 hover:border-neon-orange transition-all duration-300 mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-neon-orange to-neon-pink rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" weight="bold" />
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
                <DeviceMobile className="w-8 h-8 text-white" weight="bold" />
              </div>
              <CardTitle className="text-2xl text-neon-purple">Rate Content</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Viewers use this page to submit live ratings for resumes and LinkedIn profiles
              </p>
              <Link to="/rate">
                <Button className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple text-primary-foreground glow-effect">
                  Open Rating Page
                  <Lightning className="w-4 h-4 ml-2" weight="fill" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glow-effect border-neon-cyan/50 hover:border-neon-cyan transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-neon-cyan to-neon-green rounded-full flex items-center justify-center">
                <Monitor className="w-8 h-8 text-white" weight="bold" />
              </div>
              <CardTitle className="text-2xl text-neon-cyan">Stream Display</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Real-time display for your stream overlay showing live ratings and feedback
              </p>
              <Link to="/display">
                <Button className="w-full bg-gradient-to-r from-neon-cyan to-neon-green hover:from-neon-green hover:to-neon-cyan text-primary-foreground glow-effect">
                  Open Display
                  <Monitor className="w-4 h-4 ml-2" weight="bold" />
                </Button>
              </Link>
              <Link to="/formdisplay">
                <Button variant="outline" className="w-full mt-2">
                  Conference Leads Dashboard
                  <Users className="w-4 h-4 ml-2" weight="bold" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Realtime Test Section */}
        <div className="mb-12">
          <RealtimeTest />
        </div>

      </div>
    </div>
  );
};

export default Index;
