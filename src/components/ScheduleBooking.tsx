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

  // Helper function to format time in 12-hour format
  const formatTime = (timeString: string) => {
    const date = parse(timeString, 'HH:mm', new Date());
    return format(date, 'h:mm a');
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Available Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading available times...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availableSlots.length === 0) {
    return null; // Don't show the component if no slots available
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book a Time Slot
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Schedule a personalized resume review session
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(slotsByDate).map(([date, slots]) => (
            <div key={date}>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(parseISO(date), 'EEEE, MMM dd, yyyy')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    size="sm"
                    onClick={() => bookTimeSlot(slot.id)}
                    disabled={isBooking && selectedSlot === slot.id}
                    className="justify-start h-auto p-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isBooking && selectedSlot === slot.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Available
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">What to expect:</p>
              <p className="text-muted-foreground text-xs mt-1">
                One-on-one resume review session with personalized feedback and improvement suggestions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};