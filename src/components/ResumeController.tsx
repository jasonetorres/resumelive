import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, RefreshCw } from "lucide-react";

interface Resume {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
}

export const ResumeController = () => {
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [currentTarget, setCurrentTarget] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResumes();
    fetchCurrentTarget();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('id, name, file_path, file_type')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive",
      });
    }
  };

  const fetchCurrentTarget = async () => {
    try {
      const { data, error } = await supabase
        .from('current_target')
        .select('target_person')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentTarget(data?.target_person || '');
      console.log('ResumeController: Current target fetched:', data?.target_person);
    } catch (error) {
      console.error('Error fetching current target:', error);
    }
  };

  const changeResume = async () => {
    if (!selectedResume) {
      toast({
        title: "Error",
        description: "Please select a resume first",
        variant: "destructive",
      });
      return;
    }

    const selectedResumeData = resumes.find(r => r.id === selectedResume);
    if (!selectedResumeData) {
      toast({
        title: "Error",
        description: "Selected resume not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('ResumeController: Changing resume to:', selectedResumeData.name);
      
      const { error } = await supabase
        .from('current_target')
        .upsert({ 
          id: 1, 
          target_person: selectedResumeData.name,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setCurrentTarget(selectedResumeData.name);
      console.log('ResumeController: Resume changed successfully to:', selectedResumeData.name);
      
      toast({
        title: "Success! 📄",
        description: `Resume changed to: ${selectedResumeData.name}`,
      });
    } catch (error) {
      console.error('Error changing resume:', error);
      toast({
        title: "Error",
        description: "Failed to change resume",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentResumeName = () => {
    // currentTarget stores the resume name, not ID
    return currentTarget || 'No resume selected';
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          <span className="font-medium">Current:</span>
          <span className="text-muted-foreground">{getCurrentResumeName()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Select value={selectedResume} onValueChange={setSelectedResume}>
          <SelectTrigger>
            <SelectValue placeholder="Select a resume to display" />
          </SelectTrigger>
          <SelectContent>
            {resumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                {resume.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button 
            onClick={changeResume} 
            disabled={loading || !selectedResume}
            className="flex-1"
          >
            {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Change Resume
          </Button>
          <Button variant="outline" onClick={fetchResumes}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};