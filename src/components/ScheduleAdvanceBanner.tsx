import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const ScheduleAdvanceBanner = () => {
  const [availableSlots, setAvailableSlots] = useState(0);
  const [schedulingEnabled, setSchedulingEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Check if scheduling is enabled
      const { data: settings } = await supabase
        .from('scheduling_settings')
        .select('scheduling_enabled')
        .eq('id', 1)
        .maybeSingle();

      const enabled = settings?.scheduling_enabled ?? false;
      setSchedulingEnabled(enabled);

      if (enabled) {
        // Fetch available slots count
        await fetchAvailableSlots();
      }

      setIsLoading(false);
    };

    fetchData();

    // Subscribe to real-time updates for time_slots and bookings
    const timeSlotsChannel = supabase
      .channel('schedule-advance-slots')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_slots'
        },
        () => {
          fetchAvailableSlots();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchAvailableSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(timeSlotsChannel);
    };
  }, []);

  const fetchAvailableSlots = async () => {
    // Get all future time slots
    const { data: timeSlots } = await supabase
      .from('time_slots')
      .select('id, date, start_time')
      .eq('is_available', true);

    if (!timeSlots) {
      setAvailableSlots(0);
      return;
    }

    // Filter for future slots only
    const now = new Date();
    const futureSlots = timeSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      const [hours, minutes] = slot.start_time.split(':');
      slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return slotDate > now;
    });

    // Get booked slot IDs
    const { data: bookings } = await supabase
      .from('bookings')
      .select('time_slot_id')
      .in('status', ['confirmed', 'pending']);

    const bookedSlotIds = new Set(bookings?.map(b => b.time_slot_id) || []);

    // Count available slots (future and not booked)
    const available = futureSlots.filter(slot => !bookedSlotIds.has(slot.id));
    setAvailableSlots(available.length);
  };

  const handleClick = () => {
    navigate('/register');
  };

  if (!schedulingEnabled || isLoading) {
    return null;
  }

  return (
    <Card 
      className="mb-4 sm:mb-6 bg-gradient-to-r from-neon-purple/20 via-neon-pink/20 to-neon-purple/20 border-neon-purple/40 hover:border-neon-purple/60 transition-all cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-neon-pink/10 to-neon-purple/10 animate-pulse" />
        
        <div className="relative p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Calendar className="w-5 h-5 text-neon-purple" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Schedule in Advance
                </h3>
              </div>
              <p className="text-sm sm:text-base font-semibold text-neon-pink mb-1">
                ALL THINGS OPEN RALEIGH 10/14
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  <span className="font-bold text-neon-green">{availableSlots}</span> {availableSlots === 1 ? 'slot' : 'slots'} available
                </span>
              </div>
            </div>
            
            <Button 
              className="bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/90 hover:to-neon-pink/90 text-white font-semibold shadow-lg hover:shadow-neon-purple/50 transition-all whitespace-nowrap"
              size="lg"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
