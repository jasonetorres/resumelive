import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, User } from 'lucide-react';
import { format, parseISO, parse } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface BookingInfo {
  id: string;
  time_slots: {
    date: string;
    start_time: string;
    end_time: string;
  };
  leads: {
    name: string;
    email: string;
  };
}

export const ScheduledBookingBanner: React.FC = () => {
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to format time in 12-hour format
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString || typeof timeString !== 'string') {
      return 'Invalid time';
    }
    
    try {
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

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // Get lead data from session storage
        const leadData = sessionStorage.getItem('leadData');
        if (!leadData) {
          setIsLoading(false);
          return;
        }

        const parsedLeadData = JSON.parse(leadData);
        const leadEmail = parsedLeadData.email;

        if (!leadEmail) {
          setIsLoading(false);
          return;
        }

        // Find the lead by email and get their booking
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id')
          .eq('email', leadEmail)
          .limit(1);

        if (leadsError || !leads || leads.length === 0) {
          setIsLoading(false);
          return;
        }

        const leadId = leads[0].id;

        // Get the booking for this lead
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            time_slots (
              date,
              start_time,
              end_time
            ),
            leads (
              name,
              email
            )
          `)
          .eq('lead_id', leadId)
          .order('time_slots(date)', { ascending: true })
          .order('time_slots(start_time)', { ascending: true })
          .limit(1);

        if (bookingsError || !bookings || bookings.length === 0) {
          setIsLoading(false);
          return;
        }

        setBooking(bookings[0]);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, []);

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            <p className="text-sm text-blue-800">Checking for scheduled session...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return null; // Don't show anything if no booking
  }

  return (
    <Card className="border-green-200 bg-green-50/50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-600 text-white">
                Booked
              </Badge>
              <span className="text-sm font-medium text-green-900">
                Your Resume Review Session
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(booking.time_slots.date), 'EEEE, MMMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Clock className="h-4 w-4" />
                <span>{formatTime(booking.time_slots.start_time)} - {formatTime(booking.time_slots.end_time)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-green-800">
                <User className="h-4 w-4" />
                <span>{booking.leads.name}</span>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-xs text-green-800">
              <strong>Reminder:</strong> Your resume will be reviewed live at our booth during this time slot.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};