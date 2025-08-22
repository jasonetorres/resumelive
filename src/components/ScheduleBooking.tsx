import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { format, parseISO, parse } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface ScheduleBookingProps {
  leadId: string;
  onBookingComplete: (bookingId: string, timeSlot: TimeSlot) => void;
}

export const ScheduleBooking: React.FC<ScheduleBookingProps> = ({ 
  leadId, 
  onBookingComplete 
}) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Helper function to parse time and calculate duration
  const parseTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.getTime();
    } catch (error) {
      console.error('Error parsing time:', timeString, error);
      return 0;
    }
  };

  // Helper function to calculate session duration in minutes
  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      const start = parseTime(startTime);
      const end = parseTime(endTime);
      const durationMs = end - start;
      const durationMin = Math.round(durationMs / (1000 * 60));
      return durationMin > 0 ? durationMin : 15; // Default to 15 min if calculation fails
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 15; // Default duration
    }
  };

  // Helper function to format time in 12-hour format
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString || typeof timeString !== 'string') {
      return 'Invalid time';
    }
    
    try {
      // Handle both HH:mm and HH:mm:ss formats
      const timeParts = timeString.split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return timeString;
      }
      
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return timeString;
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      // First check if scheduling is enabled
      const { data: settings } = await supabase
        .from('scheduling_settings')
        .select('scheduling_enabled')
        .eq('id', 1)
        .single();

      if (!settings?.scheduling_enabled) {
        setAvailableSlots([]);
        setIsLoading(false);
        return;
      }

      // Fetch available time slots (not booked and in the future)
      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          *,
          bookings!left (id)
        `)
        .is('bookings.id', null) // Only slots without bookings
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to fetch available time slots');
    } finally {
      setIsLoading(false);
    }
  };

  const bookTimeSlot = async (slotId: string) => {
    setIsBooking(true);
    setSelectedSlot(slotId);
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          time_slot_id: slotId,
          lead_id: leadId,
          status: 'confirmed'
        }])
        .select(`
          id,
          time_slots (*)
        `)
        .single();

      if (error) throw error;

      toast.success('Time slot booked successfully!');
      const timeSlot = data.time_slots as unknown as TimeSlot;
      onBookingComplete(data.id, timeSlot);
    } catch (error) {
      console.error('Error booking time slot:', error);
      toast.error('Failed to book time slot');
    } finally {
      setIsBooking(false);
      setSelectedSlot(null);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <div className="space-y-1">
          <p className="font-medium">Finding Available Times</p>
          <p className="text-sm text-muted-foreground">Please wait while we check for open slots...</p>
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-muted-foreground">No Available Time Slots</p>
          <p className="text-sm text-muted-foreground">
            All slots are currently booked. Please check back later or contact us directly.
          </p>
        </div>
      </div>
    );
  }

  // Group slots by date and remove duplicates
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    
    // Check for duplicates based on start_time
    const isDuplicate = acc[date].some(existing => existing.start_time === slot.start_time);
    if (!isDuplicate) {
      acc[date].push(slot);
    }
    
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Choose Your Time Slot</h3>
        <p className="text-muted-foreground text-sm">
          Select a convenient time for your personalized resume review session
        </p>
      </div>

      {/* Available Slots */}
      <div className="space-y-6">
        {Object.entries(slotsByDate).map(([date, slots]) => (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <Calendar className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-lg">
                {format(parseISO(date), 'EEEE, MMMM dd, yyyy')}
              </h4>
            </div>
            
            {/* Time Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map((slot) => (
                <Card 
                  key={slot.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    selectedSlot === slot.id && isBooking 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => bookTimeSlot(slot.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Top Row - Time and Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isBooking && selectedSlot === slot.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-green-600"></div>
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-lg">
                              {formatTime(slot.start_time)}
                            </div>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">
                          Open
                        </Badge>
                      </div>
                      
                      {/* Bottom Row - Duration and Booking Status */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {calculateDuration(slot.start_time, slot.end_time)} minute session
                        </div>
                        
                        {isBooking && selectedSlot === slot.id && (
                          <div className="text-xs text-primary font-medium">
                            Booking...
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Info Section */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-medium text-blue-900">Live Resume Review Experience</p>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• One-on-one resume review with an expert at our booth</p>
                <p>• Your resume will be displayed on screen for educational purposes</p>
                <p>• Live feedback and improvement suggestions</p>
                <p>• Interactive learning experience with other attendees nearby</p>
                <p>• Tips for better job application success</p>
              </div>
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> Your resume will be visible to others during the session as part of the interactive learning experience.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};