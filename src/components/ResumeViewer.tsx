import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, Eye, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ResumeViewerProps {
  className?: string;
}

export function ResumeViewer({ className }: ResumeViewerProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    toast({
      title: "Resume uploaded",
      description: `Successfully uploaded ${file.name}`,
    });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (uploadedFile && previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = uploadedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <Card className="flex-1 flex flex-col border-neon-purple/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-neon-purple" />
              <span className="text-neon-purple">Resume Viewer</span>
            </div>
            {uploadedFile && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-neon-green text-neon-green">
                  {uploadedFile.type.includes('pdf') ? 'PDF' : 'Image'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4">
          {!uploadedFile ? (
            <div 
              className="flex-1 border-2 border-dashed border-neon-purple/30 rounded-lg flex flex-col items-center justify-center p-8 hover:border-neon-purple/50 transition-colors cursor-pointer"
              onClick={triggerUpload}
            >
              <Upload className="w-12 h-12 text-neon-purple mb-4" />
              <h3 className="text-lg font-semibold text-neon-purple mb-2">
                Upload Resume
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Click to upload or drag and drop<br />
                PDF, JPEG, or PNG files (max 10MB)
              </p>
              <Button 
                variant="outline" 
                className="border-neon-purple text-neon-purple hover:bg-neon-purple/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-neon-cyan" />
                  <span className="font-medium truncate max-w-xs" title={uploadedFile.name}>
                    {uploadedFile.name}
                  </span>
                </div>
                <Badge variant="outline" className="border-neon-orange text-neon-orange">
                  {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                </Badge>
              </div>
              
              <div className="flex-1 bg-muted/20 rounded-lg overflow-hidden border border-border/50">
                {uploadedFile.type === 'application/pdf' ? (
                  <iframe
                    src={previewUrl || ''}
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={previewUrl || ''}
                      alt="Resume Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
}