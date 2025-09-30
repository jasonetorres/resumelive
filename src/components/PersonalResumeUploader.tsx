import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PersonalResumeUploaderProps {
  className?: string;
  onUploadSuccess?: () => void;
}

export function PersonalResumeUploader({ className, onUploadSuccess }: PersonalResumeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, id: string}>>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPEG, PNG)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { data, error: dbError } = await (supabase as any)
        .from('resumes')
        .insert({
          name: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Add to local state
      setUploadedFiles(prev => [...prev, { name: file.name, id: data.id }]);

      toast({
        title: "Upload successful! ✅",
        description: `${file.name} has been uploaded successfully.`,
      });

      onUploadSuccess?.();

      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Hide component after successful upload
  if (uploadedFiles.length > 0) {
    return null;
  }

  return (
    <div className={className}>
      <Card className="border-neon-purple/20 glow-effect">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-neon-purple text-lg">Upload Your Resume</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Share your resume for future conference reviews
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 text-center hover:border-neon-purple/50 transition-colors">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="resume-upload"
            />
            <label 
              htmlFor="resume-upload" 
              className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50' : ''}`}
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Click to upload resume</p>
                <p className="text-xs text-muted-foreground">PDF, JPEG, PNG up to 10MB</p>
              </div>
            </label>
          </div>

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          )}

          {/* Uploaded Files This Session */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neon-green">Uploaded This Session:</h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-neon-green/10 rounded border border-neon-green/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon-green" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <Badge className="bg-neon-green text-primary-foreground text-xs">Uploaded</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Upload to potentially be reviewed live
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}