import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader as Loader2, UserCheck, UserX } from "lucide-react";

export const SignupToggle = () => {
  const { toast } = useToast();
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchSignupSetting = async () => {
      try {
        const { data, error } = await supabase
          .from('signup_settings')
          .select('signup_enabled')
          .eq('id', 1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSignupEnabled(data.signup_enabled);
        }
      } catch (error) {
        console.error('Error fetching signup setting:', error);
        toast({
          title: "Error",
          description: "Failed to load signup settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSignupSetting();

    const channel = supabase
      .channel('signup-settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'signup_settings'
        },
        (payload) => {
          setSignupEnabled(payload.new.signup_enabled);
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
      const { error } = await supabase
        .from('signup_settings')
        .update({
          signup_enabled: checked,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;

      setSignupEnabled(checked);
      toast({
        title: checked ? "Signup Enabled" : "Signup Disabled",
        description: checked
          ? "Users must register before accessing /rate"
          : "Users can directly access /rate without registration",
      });
    } catch (error) {
      console.error('Error updating signup setting:', error);
      toast({
        title: "Error",
        description: "Failed to update signup setting",
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
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {signupEnabled ? <UserCheck className="h-5 w-5" /> : <UserX className="h-5 w-5" />}
          Signup Requirement
        </CardTitle>
        <CardDescription>
          Control whether viewers must register before accessing the rating page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1">
            <Label htmlFor="signup-toggle" className="text-base font-medium">
              {signupEnabled ? "Signup Required" : "Direct Access"}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {signupEnabled
                ? "Users must complete registration form before rating"
                : "Users can rate without registration (perfect for streams)"}
            </p>
          </div>
          <Switch
            id="signup-toggle"
            checked={signupEnabled}
            onCheckedChange={handleToggle}
            disabled={updating}
          />
        </div>
      </CardContent>
    </Card>
  );
};
