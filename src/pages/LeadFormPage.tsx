import React from 'react';
import { LeadForm } from '@/components/LeadForm';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi } from 'lucide-react';

interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
}

const LeadFormPage = () => {
  const navigate = useNavigate();

  const handleSuccess = (leadData: LeadFormData) => {
    // Store lead completion in session storage
    sessionStorage.setItem('leadCompleted', 'true');
    sessionStorage.setItem('leadData', JSON.stringify(leadData));
    
    // Redirect to rating page
    navigate('/rate-direct');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">
            Conference Registration
          </h1>
          
          {/* Live Status Indicators */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge variant="outline" className="border-neon-green text-neon-green bg-neon-green/10 flex items-center gap-1 text-xs">
              <Wifi className="w-3 h-3" />
              Live
            </Badge>
            <Badge variant="outline" className="border-neon-cyan text-neon-cyan bg-neon-cyan/10 flex items-center gap-1 text-xs">
              <Users className="w-3 h-3" />
              Required
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm sm:text-base">
            Please register to participate in the conference rating system
          </p>
        </div>

        {/* Main Content */}
        <Card className="border border-neon-purple/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-lg">Registration Form</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <LeadForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadFormPage;