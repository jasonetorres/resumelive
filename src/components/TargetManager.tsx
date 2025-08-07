import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Target, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TargetManagerProps {
  currentTarget: string | null;
  onTargetChange: (target: string | null) => void;
}

export function TargetManager({ currentTarget, onTargetChange }: TargetManagerProps) {
  const [newTarget, setNewTarget] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [ratingsCount, setRatingsCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (currentTarget) {
      fetchRatingsCount();
    } else {
      setRatingsCount(0);
    }
  }, [currentTarget]);

  const fetchRatingsCount = async () => {
    if (!currentTarget) return;
    
    const { count } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('target_person', currentTarget);
    
    setRatingsCount(count || 0);
  };

  const handleSetTarget = async () => {
    if (!newTarget.trim()) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('current_target')
        .update({ 
          target_person: newTarget.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;
      
      onTargetChange(newTarget.trim());
      setNewTarget('');
      toast({
        title: "Target Set",
        description: `Now collecting reviews for ${newTarget.trim()}`,
      });
    } catch (error) {
      console.error('Error setting target:', error);
      toast({
        title: "Error",
        description: "Failed to set target",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearRatings = async () => {
    if (!currentTarget) return;
    
    try {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('target_person', currentTarget);

      if (error) throw error;
      
      setRatingsCount(0);
      toast({
        title: "Ratings Cleared",
        description: `All ratings for ${currentTarget} have been cleared`,
      });
    } catch (error) {
      console.error('Error clearing ratings:', error);
      toast({
        title: "Error",
        description: "Failed to clear ratings",
        variant: "destructive",
      });
    }
  };

  const handleClearTarget = async () => {
    try {
      const { error } = await supabase
        .from('current_target')
        .update({ 
          target_person: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;
      
      onTargetChange(null);
      toast({
        title: "Target Cleared",
        description: "No target is currently set",
      });
    } catch (error) {
      console.error('Error clearing target:', error);
      toast({
        title: "Error",
        description: "Failed to clear target",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6 border-2 border-neon-purple/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-neon-purple">
          <Users className="w-5 h-5" />
          Current Speaker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentTarget ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline" className="text-neon-green border-neon-green/50 mb-2">
                  Currently Rating
                </Badge>
                <h3 className="text-2xl font-bold text-neon-green">{currentTarget}</h3>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {ratingsCount} reviews collected
                </p>
              </div>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-neon-orange border-neon-orange/50">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Ratings
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all ratings for {currentTarget}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {ratingsCount} ratings for {currentTarget}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearRatings} className="bg-destructive hover:bg-destructive/90">
                        Clear Ratings
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" size="sm" onClick={handleClearTarget}>
                  End Session
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">Set a target person to start collecting reviews</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter person's name (e.g., Jerry)"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSetTarget()}
                className="flex-1"
              />
              <Button 
                onClick={handleSetTarget}
                disabled={!newTarget.trim() || isUpdating}
                className="bg-neon-purple hover:bg-neon-purple/90"
              >
                {isUpdating ? 'Setting...' : 'Set Target'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}