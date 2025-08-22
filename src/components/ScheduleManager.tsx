import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Clock } from 'lucide-react';
import { format, parseISO, parse } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  booking?: {
    id: string;
    lead: {
      name: string;
      email: string;
    };
  };
}

export const ScheduleManager: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add new slot form state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(15); // Default 15 minutes
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isGeneratingSlots, setIsGeneratingSlots] = useState(false);
  
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

  const fetchTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          *,
          bookings (
            id,
            leads (
              name,
              email
            )
          )
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = data?.map(slot => ({
        ...slot,
        booking: slot.bookings?.[0] ? {
          id: slot.bookings[0].id,
          lead: slot.bookings[0].leads
        } : undefined
      })) || [];

      setTimeSlots(transformedData);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to fetch time slots');
    } finally {
      setIsLoading(false);
    }
  };

  // Update end time when start time or duration changes
  const updateEndTime = (start: string, durationMinutes: number) => {
    if (!start) return;
    
    const [hours, minutes] = start.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    const endTimeString = endDate.toTimeString().slice(0, 5);
    
    setEndTime(endTimeString);
  };

  // Handle start time change
  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    if (time) {
      updateEndTime(time, duration);
    }
  };

  // Handle duration change
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    if (startTime) {
      updateEndTime(startTime, newDuration);
    }
  };

  const addTimeSlot = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setIsAddingSlot(true);
    try {
      const { error } = await supabase
        .from('time_slots')
        .insert([{
          date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
          is_available: true
        }]);

      if (error) throw error;

      toast.success('Time slot added successfully');
      setSelectedDate(undefined);
      setStartTime('');
      setEndTime('');
      setDuration(15);
      fetchTimeSlots();
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast.error('Failed to add time slot');
    } finally {
      setIsAddingSlot(false);
    }
  };

  const generateDaySlots = async (startHour: number, endHour: number, slotDuration: number = 15) => {
    if (!selectedDate) {
      toast.error('Please select a date first');
      return;
    }

    setIsGeneratingSlots(true);
    try {
      const slots = [];
      let currentHour = startHour;
      let currentMinute = 0;

      while (currentHour < endHour || (currentHour === endHour && currentMinute === 0)) {
        const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Calculate end time
        const endMinutes = currentMinute + slotDuration;
        const calculatedEndHour = currentHour + Math.floor(endMinutes / 60);
        const finalEndMinute = endMinutes % 60;
        
        if (calculatedEndHour < endHour || (calculatedEndHour === endHour && finalEndMinute === 0)) {
          const endTime = `${calculatedEndHour.toString().padStart(2, '0')}:${finalEndMinute.toString().padStart(2, '0')}`;
          
          slots.push({
            date: format(selectedDate, 'yyyy-MM-dd'),
            start_time: startTime,
            end_time: endTime,
            is_available: true
          });
        }

        // Move to next slot
        currentMinute += slotDuration;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
      }

      // Insert all slots
      const { error } = await supabase
        .from('time_slots')
        .insert(slots);

      if (error) throw error;

      toast.success(`Generated ${slots.length} time slots successfully`);
      fetchTimeSlots();
    } catch (error) {
      console.error('Error generating time slots:', error);
      toast.error('Failed to generate time slots');
    } finally {
      setIsGeneratingSlots(false);
    }
  };

  const deleteTimeSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot? This will also cancel any existing booking.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast.success('Time slot deleted successfully');
      fetchTimeSlots();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      toast.error('Failed to delete time slot');
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  return (
    <div className="space-y-6">
      {/* Add New Time Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Generate Section */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4" />
              <Label className="font-medium">Quick Generate (15-min slots)</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Button
                onClick={() => generateDaySlots(9, 17)}
                disabled={!selectedDate || isGeneratingSlots}
                variant="outline"
                size="sm"
              >
                9:00 AM - 5:00 PM
              </Button>
              <Button
                onClick={() => generateDaySlots(10, 16)}
                disabled={!selectedDate || isGeneratingSlots}
                variant="outline"
                size="sm"
              >
                10:00 AM - 4:00 PM
              </Button>
              <Button
                onClick={() => generateDaySlots(12, 18)}
                disabled={!selectedDate || isGeneratingSlots}
                variant="outline"
                size="sm"
              >
                12:00 PM - 6:00 PM
              </Button>
              <Button
                onClick={() => generateDaySlots(13, 17)}
                disabled={!selectedDate || isGeneratingSlots}
                variant="outline"
                size="sm"
              >
                1:00 PM - 5:00 PM
              </Button>
            </div>
            {isGeneratingSlots && (
              <p className="text-sm text-muted-foreground mt-2">Generating slots...</p>
            )}
          </div>

          {/* Manual Add Section */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (min)</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-muted"
                readOnly
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={addTimeSlot} 
                disabled={isAddingSlot}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Slot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Slots ({timeSlots.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading time slots...</p>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No time slots created yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booked By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>
                        {format(parseISO(slot.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={slot.booking ? "secondary" : "default"}>
                          {slot.booking ? "Booked" : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {slot.booking ? (
                          <div className="text-sm">
                            <div className="font-medium">{slot.booking.lead.name}</div>
                            <div className="text-muted-foreground">{slot.booking.lead.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTimeSlot(slot.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};