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
import { Loader2, Users, Trophy, CheckCircle, Calendar } from 'lucide-react';
import { ScheduleBooking } from './ScheduleBooking';
import { format, parse } from 'date-fns';

const leadSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters'),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSuccess: (leadData: LeadFormData) => void;
}

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface Booking {
  id: string;
  time_slot: TimeSlot;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showScheduling, setShowScheduling] = useState(false);
  const { toast } = useToast();

  // Helper function to format time in 12-hour format
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString || typeof timeString !== 'string') {
      return 'Invalid time';
    }
    
    try {
      const date = parse(timeString, 'HH:mm', new Date());
      if (isNaN(date.getTime())) {
        return timeString; // Return original if parsing fails
      }
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return timeString; // Return original if formatting fails
    }
  };

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      jobTitle: '',
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    
    try {
      // Store in Supabase leads table and get the created lead ID
      const { data: leadData, error } = await supabase
        .from('leads')
        .insert([
          {
            name: `${data.firstName} ${data.lastName}`, // Keep name for backward compatibility
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            job_title: data.jobTitle,
          }
        ])
        .select()
        .single();

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

      // Store lead ID for potential scheduling
      setLeadId(leadData.id);

      // Check if scheduling is enabled
      const { data: settings } = await supabase
        .from('scheduling_settings')
        .select('scheduling_enabled')
        .eq('id', 1)
        .single();

      // Also store in session storage as backup
      sessionStorage.setItem('leadData', JSON.stringify({
        ...data,
        submittedAt: new Date().toISOString(),
        leadId: leadData.id,
      }));
      
      toast({
        title: "Welcome! 🎉",
        description: "Thanks for joining! Your information has been saved.",
      });

      if (settings?.scheduling_enabled) {
        setShowScheduling(true);
      } else {
        onSuccess(data);
      }
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

  const handleBookingComplete = (bookingId: string, timeSlot: TimeSlot) => {
    setBooking({ id: bookingId, time_slot: timeSlot });
    setShowScheduling(false);
    
    toast({
      title: "Booking Confirmed! 🗓️",
      description: `Your session is scheduled for ${timeSlot.date} at ${formatTime(timeSlot.start_time)}`,
    });
  };

  const handleSkipScheduling = () => {
    setShowScheduling(false);
    const formData = form.getValues();
    onSuccess(formData);
  };

  // Show booking confirmation if already booked
  if (booking) {
    const formData = form.getValues();
    return (
      <div className="space-y-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">Registration & Booking Complete!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-green-800">
                <strong>{formData.firstName} {formData.lastName}</strong>
              </p>
              <p className="text-sm text-green-700">{formData.email}</p>
              <p className="text-sm text-green-700">{formData.jobTitle}</p>
            </div>
            
            <div className="border-t border-green-200 pt-3">
              <div className="flex items-center gap-2 text-green-800">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Scheduled Session:</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                {booking.time_slot.date} at {formatTime(booking.time_slot.start_time)} - {formatTime(booking.time_slot.end_time)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          onClick={() => onSuccess(formData)}
          className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 text-white font-semibold"
        >
          Continue to Session
        </Button>
      </div>
    );
  }

  // Show scheduling options if enabled and lead is created
  if (showScheduling && leadId) {
    return (
      <div className="space-y-4">
        <ScheduleBooking 
          leadId={leadId}
          onBookingComplete={handleBookingComplete}
        />
        
        <Button 
          onClick={handleSkipScheduling}
          variant="outline" 
          className="w-full"
        >
          Skip Scheduling - Continue to Session
        </Button>
      </div>
    );
  }

  // Show main registration form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">First Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="First name" 
                    {...field}
                    disabled={isSubmitting}
                    className="border-muted-foreground/20 focus:border-neon-purple h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Last Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Last name" 
                    {...field}
                    disabled={isSubmitting}
                    className="border-muted-foreground/20 focus:border-neon-purple h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Email Address</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Enter your email" 
                  {...field}
                  disabled={isSubmitting}
                  className="border-muted-foreground/20 focus:border-neon-purple h-9"
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
              <FormLabel className="text-sm">Job Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Software Engineer, Product Manager" 
                  {...field}
                  disabled={isSubmitting}
                  className="border-muted-foreground/20 focus:border-neon-purple h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 text-white font-semibold mt-4 h-9"
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
              Join Session
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};