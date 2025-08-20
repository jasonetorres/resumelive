import React from 'react';
import { LeadForm } from '@/components/LeadForm';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/47be24da-2929-4836-b53c-587b774ca249.png" 
              alt="Conference Logo" 
              className="w-12 h-12 sm:w-14 sm:h-14"
            />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
              Conference Registration
            </h1>
            <img 
              src="/lovable-uploads/47be24da-2929-4836-b53c-587b774ca249.png" 
              alt="Conference Logo" 
              className="w-12 h-12 sm:w-14 sm:h-14"
            />
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
            
            {/* Fine Print / Terms */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Terms & Conditions</h3>
              <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  By registering and participating in this conference, you acknowledge and agree that:
                </p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>
                    Any resume or personal information you upload may be displayed publicly on stage and viewed by all conference attendees.
                  </li>
                  <li>
                    Your participation data, ratings, and feedback may be visible to other participants and conference organizers.
                  </li>
                  <li>
                    You will use the live chat feature appropriately and professionally, refraining from inappropriate, offensive, or disruptive content.
                  </li>
                  <li>
                    Conference organizers reserve the right to remove inappropriate content or restrict access for violations of conduct policies.
                  </li>
                  <li>
                    Your participation constitutes consent for potential recording, photography, or live streaming of the event.
                  </li>
                  <li>
                    All information provided is subject to the conference's privacy policy and may be used for event analytics and improvement.
                  </li>
                </ul>
                <p className="text-muted-foreground/80 italic">
                  By proceeding with registration, you confirm that you have read, understood, and agree to these terms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadFormPage;