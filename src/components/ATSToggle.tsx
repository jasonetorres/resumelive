import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const ATSToggle = () => {
  const [atsEnabled, setAtsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchATSSettings();
  }, []);

  const fetchATSSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ats_settings')
        .select('ats_enabled')
        .eq('id', 1)
        .single();

      if (error) throw error;
      setAtsEnabled(data?.ats_enabled || false);
    } catch (error) {
      console.error('Error fetching ATS settings:', error);
      toast({
        title: "Error",
        description: "Failed to load ATS settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleATS = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('ats_settings')
        .update({ ats_enabled: !atsEnabled })
        .eq('id', 1);

      if (error) throw error;

      setAtsEnabled(!atsEnabled);
      toast({
        title: atsEnabled ? "ATS Disabled" : "ATS Enabled",
        description: atsEnabled 
          ? "Resume analysis features have been turned off" 
          : "Resume analysis features are now active",
      });
    } catch (error) {
      console.error('Error updating ATS settings:', error);
      toast({
        title: "Error",
        description: "Failed to update ATS settings",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-white/20">
      <CardHeader>
        <CardTitle className="text-white">ATS Analysis</CardTitle>
        <CardDescription className="text-white/70">
          Enable resume compatibility scoring and skills extraction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            checked={atsEnabled}
            onCheckedChange={toggleATS}
            disabled={updating}
            className="data-[state=checked]:bg-primary"
          />
          <span className="text-white text-sm">
            {updating ? 'Updating...' : atsEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {atsEnabled && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded">
            <p className="text-white/80 text-sm">
              🚀 ATS features active: Resume scoring, skills extraction, and compatibility analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};