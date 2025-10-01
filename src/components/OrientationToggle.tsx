import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Smartphone } from "lucide-react";

export const OrientationToggle = () => {
  const { toast } = useToast();
  const [isPortrait, setIsPortrait] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrientation = async () => {
      try {
        const { data, error } = await supabase
          .from('display_settings')
          .select('orientation')
          .eq('id', 1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setIsPortrait(data.orientation === 'portrait');
        }
      } catch (error) {
        console.error('Error fetching orientation:', error);
        toast({
          title: "Error",
          description: "Failed to load orientation settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrientation();

    const channel = supabase
      .channel('orientation-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'display_settings'
        },
        (payload) => {
          setIsPortrait(payload.new.orientation === 'portrait');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleToggle = async (checked: boolean) => {
    setUpdating(true);
    try {
      const orientation = checked ? 'portrait' : 'landscape';
      const { error } = await supabase
        .from('display_settings')
        .update({
          orientation,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;

      setIsPortrait(checked);
      toast({
        title: checked ? "Portrait Mode" : "Landscape Mode",
        description: checked
          ? "Display optimized for vertical monitors"
          : "Display optimized for horizontal monitors",
      });
    } catch (error) {
      console.error('Error updating orientation:', error);
      toast({
        title: "Error",
        description: "Failed to update orientation",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPortrait ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          Display Orientation
        </CardTitle>
        <CardDescription>
          Control the layout orientation for the live display screen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1">
            <Label htmlFor="orientation-toggle" className="text-base font-medium">
              {isPortrait ? "Portrait Mode" : "Landscape Mode"}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {isPortrait
                ? "Resume full-height, stats at bottom in a row"
                : "Resume on left, stats on right in a column"}
            </p>
          </div>
          <Switch
            id="orientation-toggle"
            checked={isPortrait}
            onCheckedChange={handleToggle}
            disabled={updating}
          />
        </div>
      </CardContent>
    </Card>
  );
};
