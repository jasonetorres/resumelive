import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User, Mail, Briefcase, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO, parse } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
  time_slots: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
  };
  leads: {
    id: string;
    name: string;
    email: string;
    job_title: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export default function SchedulePage() {
  const { toast: hookToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Helper function to format time in 12-hour format (handles HH:mm and HH:mm:ss)
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString || typeof timeString !== 'string') {
      return 'Invalid time';
    }
    try {
      const parts = timeString.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "torcresumes") {
      setIsAuthenticated(true);
      fetchBookings();
    } else {
      toast.error("Incorrect password");
      setPasswordInput("");
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          time_slots (*),
          leads (*)
        `)
        .order('time_slots(date)', { ascending: true })
        .order('time_slots(start_time)', { ascending: true });

      if (error) throw error;

      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredBookings(bookings);
      return;
    }

    const filtered = bookings.filter(booking => 
      booking.leads.name.toLowerCase().includes(term.toLowerCase()) ||
      booking.leads.email.toLowerCase().includes(term.toLowerCase()) ||
      booking.leads.job_title.toLowerCase().includes(term.toLowerCase()) ||
      format(parseISO(booking.time_slots.date), 'MMM dd, yyyy').toLowerCase().includes(term.toLowerCase())
    );
    setFilteredBookings(filtered);
  };

  const cancelBooking = async (bookingId: string, leadName: string) => {
    if (!confirm(`Are you sure you want to cancel the booking for ${leadName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings.filter(booking => 
        !searchTerm || 
        booking.leads.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.leads.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.leads.job_title.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      
      toast.success("Booking cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  // Real-time subscription for bookings
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Booking change:', payload);
          fetchBookings(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Schedule Access</CardTitle>
            <p className="text-muted-foreground">Enter password to view bookings</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                Access Schedule
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/formdisplay">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Booking Schedule</h1>
          <p className="text-muted-foreground">View and manage all scheduled sessions</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/formdisplay">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Button onClick={fetchBookings} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, job title, or date..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Bookings Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No bookings found matching your search." : "No bookings scheduled yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {booking.leads.name}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Briefcase className="h-3 w-3" />
                            {booking.leads.job_title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {booking.leads.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(parseISO(booking.time_slots.date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatTime(booking.time_slots.start_time)} - {formatTime(booking.time_slots.end_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelBooking(booking.id, booking.leads.name)}
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
          
          {/* Results Summary */}
          {!isLoading && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredBookings.length} of {bookings.length} bookings
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}