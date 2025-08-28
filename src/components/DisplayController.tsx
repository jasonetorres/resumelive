import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, RotateCcw, Zap } from "lucide-react";

export const DisplayController = () => {
  const { toast } = useToast();
  const [clearing, setClearing] = useState<string | null>(null);

  const clearData = async (dataType: 'ratings' | 'reactions' | 'questions' | 'all') => {
    setClearing(dataType);
    try {
      console.log('DisplayController: Clearing data type:', dataType);
      let operations = [];
      
      if (dataType === 'ratings' || dataType === 'all') {
        operations.push(supabase.from('ratings').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      }
      
      if (dataType === 'reactions' || dataType === 'all') {
        operations.push(supabase.from('sounds').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      }
      
      if (dataType === 'questions' || dataType === 'all') {
        operations.push(supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
        operations.push(supabase.from('question_upvotes').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
      }

      await Promise.all(operations);
      
      console.log('DisplayController: Successfully cleared:', dataType);
      const message = dataType === 'all' ? 'All data cleared! 🗑️' : `${dataType} cleared! ✅`;
      toast({
        title: "Success",
        description: message,
      });
    } catch (error) {
      console.error(`Error clearing ${dataType}:`, error);
      toast({
        title: "Error",
        description: `Failed to clear ${dataType}`,
        variant: "destructive",
      });
    } finally {
      setClearing(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <RotateCcw className="h-5 w-5" />
              <span className="text-sm">Clear Ratings</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Ratings?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all ratings data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => clearData('ratings')}
                disabled={clearing === 'ratings'}
              >
                {clearing === 'ratings' ? 'Clearing...' : 'Clear Ratings'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <Zap className="h-5 w-5" />
              <span className="text-sm">Clear Reactions</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Reactions?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all sound effects and emoji reactions. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => clearData('reactions')}
                disabled={clearing === 'reactions'}
              >
                {clearing === 'reactions' ? 'Clearing...' : 'Clear Reactions'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <RotateCcw className="h-5 w-5" />
              <span className="text-sm">Clear Questions</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Questions?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all questions and upvotes. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => clearData('questions')}
                disabled={clearing === 'questions'}
              >
                {clearing === 'questions' ? 'Clearing...' : 'Clear Questions'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="h-16 flex flex-col items-center justify-center space-y-1">
              <Trash2 className="h-5 w-5" />
              <span className="text-sm">Clear All Data</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete ALL ratings, reactions, and questions. This action cannot be undone and will reset the entire display.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => clearData('all')}
                disabled={clearing === 'all'}
                className="bg-destructive hover:bg-destructive/90"
              >
                {clearing === 'all' ? 'Clearing...' : 'Clear All Data'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="text-sm text-muted-foreground text-center">
        Use these controls to manage what appears on the live display
      </div>
    </div>
  );
};