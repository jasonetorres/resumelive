import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Users, Trophy } from 'lucide-react';

const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters'),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSuccess: (leadData: LeadFormData) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      jobTitle: '',
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    
    try {
      // Store in Supabase leads table
      const { error } = await (supabase as any)
        .from('leads')
        .insert([
          {
            name: data.name,
            email: data.email,
            job_title: data.jobTitle,
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Email already registered",
            description: "This email has already been used to join the session.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      // Also store in session storage as backup
      sessionStorage.setItem('leadData', JSON.stringify({
        ...data,
        submittedAt: new Date().toISOString(),
      }));
      
      toast({
        title: "Welcome! 🎉",
        description: "Thanks for joining! Your information has been saved.",
      });

      onSuccess(data);
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-neon-purple/20 bg-card/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-neon-purple/10 border border-neon-purple/20">
              <Trophy className="w-6 h-6 text-neon-purple" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
            Join Resume Ratings
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Help us improve resumes with your valuable feedback. Enter your details to get started.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        {...field}
                        disabled={isSubmitting}
                        className="border-muted-foreground/20 focus:border-neon-purple"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="Enter your email" 
                        {...field}
                        disabled={isSubmitting}
                        className="border-muted-foreground/20 focus:border-neon-purple"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Software Engineer, Product Manager" 
                        {...field}
                        disabled={isSubmitting}
                        className="border-muted-foreground/20 focus:border-neon-purple"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 text-white font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Join the Session
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By joining, you'll help provide valuable feedback to improve resumes and professional profiles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};