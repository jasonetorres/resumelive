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
    const date = parse(timeString, 'HH:mm', new Date());
    return date.getTime();
  };

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

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isBooking && selectedSlot === slot.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-base">
                            {formatTime(slot.start_time)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round((parseTime(slot.end_time) - parseTime(slot.start_time)) / 60000)} min session
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          Available
                        </Badge>
                      </div>
                    </div>
                    
                    {isBooking && selectedSlot === slot.id && (
                      <div className="mt-3 text-sm text-primary font-medium">
                        Booking your session...
                      </div>
                    )}
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
            <div className="space-y-1">
              <p className="font-medium text-blue-900">What to Expect</p>
              <p className="text-sm text-blue-800">
                • One-on-one resume review with an expert<br/>
                • Personalized feedback and improvement suggestions<br/>
                • Tips for better job application success
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};