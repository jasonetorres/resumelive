import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, X, Eye, Download, CreditCard as Edit, Trash2, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Resume {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface ResumeManagerProps {
  className?: string;
}

export function ResumeManager({ className }: ResumeManagerProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes((data as unknown as Resume[]) || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await (supabase as any)
        .from('resumes')
        .insert({
          name: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      toast({
        title: "Resume uploaded",
        description: `Successfully uploaded ${file.name}`,
      });

      // Refresh the list
      fetchResumes();
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDeleteResume = async (resume: Resume) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([resume.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await (supabase as any)
        .from('resumes')
        .delete()
        .eq('id', resume.id);

      if (dbError) throw dbError;

      toast({
        title: "Resume deleted",
        description: `Successfully deleted ${resume.name}`,
      });

      // Refresh the list
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditName = async (id: string) => {
    if (!editName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a valid name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('resumes')
        .update({ name: editName.trim() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Name updated",
        description: "Resume name updated successfully",
      });

      setEditingId(null);
      setEditName('');
      fetchResumes();
    } catch (error) {
      console.error('Error updating resume name:', error);
      toast({
        title: "Update failed",
        description: "Failed to update resume name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading resumes...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Section */}
      <Card className="border-neon-purple/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-neon-purple" />
            Upload New Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            {uploading && (
              <div className="flex items-center gap-2 text-neon-cyan">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Supported formats: PDF, JPEG, PNG (max 10MB)
          </p>
        </CardContent>
      </Card>

      {/* Resumes List */}
      <Card className="border-neon-cyan/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-neon-cyan" />
              Uploaded Resumes ({resumes.length})
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchResumes}
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No resumes uploaded yet</p>
              <p className="text-sm">Upload your first resume above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    {editingId === resume.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="max-w-xs"
                          placeholder="Enter new name"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleEditName(resume.id)}
                          className="bg-neon-green text-primary-foreground"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium truncate">{resume.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <Badge variant="outline" className="border-neon-orange text-neon-orange">
                            {resume.file_type.includes('pdf') ? 'PDF' : 'Image'}
                          </Badge>
                          <span>{formatFileSize(resume.file_size)}</span>
                          <span>Uploaded {formatDate(resume.created_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {/* Preview Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>{resume.name}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 bg-muted/20 rounded-lg overflow-hidden border border-border/50 h-96">
                          {resume.file_type === 'application/pdf' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                              <FileText className="w-16 h-16 text-neon-purple mb-4" />
                              <p className="text-lg font-semibold mb-2">PDF Resume</p>
                              <p className="text-sm text-muted-foreground mb-4 text-center">
                                Click the button below to open the PDF in a new tab
                              </p>
                              <Button
                                onClick={() => window.open(getFileUrl(resume.file_path), '_blank')}
                                className="bg-neon-purple text-primary-foreground hover:bg-neon-purple/90"
                              >
                                Open PDF in New Tab
                              </Button>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <img
                                src={getFileUrl(resume.file_path)}
                                alt="Resume Preview"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Download */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = getFileUrl(resume.file_path);
                        link.download = resume.name;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="border-neon-green text-neon-green hover:bg-neon-green/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    {/* Edit Name */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(resume.id);
                        setEditName(resume.name);
                      }}
                      className="border-neon-purple text-neon-purple hover:bg-neon-purple/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{resume.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteResume(resume)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}