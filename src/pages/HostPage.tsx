import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Soundboard } from "@/components/Soundboard";
import { ResumeController } from "@/components/ResumeController";
import { DisplayController } from "@/components/DisplayController";

const HostPage = () => {
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

          <Card className="lg:col-span-2">
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
      </div>
    </div>
  );
};

export default HostPage;