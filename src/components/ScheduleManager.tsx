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
import { format, parseISO } from 'date-fns';
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
  const [isAddingSlot, setIsAddingSlot] = useState(false);

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
      fetchTimeSlots();
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast.error('Failed to add time slot');
    } finally {
      setIsAddingSlot(false);
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
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
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
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
                        {slot.start_time} - {slot.end_time}
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