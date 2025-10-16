import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Search, RefreshCw, Users, Calendar, TrendingUp, Trash2, RotateCcw, Lock, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ScheduleManager } from "@/components/ScheduleManager";
import { ModerationDashboard } from "@/components/ModerationDashboard";
import { Link } from "react-router-dom";

interface Lead {
  id: string;
  name: string;
  email: string;
  job_title: string;
  created_at: string;
  updated_at: string;
}

interface LeadStats {
  total: number;
  today: number;
  thisWeek: number;
  recent: Lead[];
}

export default function FormDisplay() {
  const { toast: hookToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('dashboardAuthenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [schedulingEnabled, setSchedulingEnabled] = useState(false);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showModerationDashboard, setShowModerationDashboard] = useState(false);
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    recent: []
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "torcresumes") {
      setIsAuthenticated(true);
      localStorage.setItem('dashboardAuthenticated', 'true');
      fetchSchedulingSettings();
    } else {
      toast.error("Incorrect password");
      setPasswordInput("");
    }
  };

  const fetchSchedulingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduling_settings')
        .select('scheduling_enabled')
        .eq('id', 1)
        .single();
      
      if (!error && data) {
        setSchedulingEnabled(data.scheduling_enabled);
      }
    } catch (error) {
      console.error('Error fetching scheduling settings:', error);
    }
  };

  const toggleScheduling = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduling_settings')
        .update({ scheduling_enabled: enabled })
        .eq('id', 1);
      
      if (error) throw error;
      
      setSchedulingEnabled(enabled);
      toast.success(enabled ? "Scheduling enabled" : "Scheduling disabled");
    } catch (error) {
      console.error('Error updating scheduling settings:', error);
      toast.error("Failed to update scheduling settings");
    }
  };

  const handleClearAllForNewEvent = async () => {
    if (!confirm('🎉 Are you sure you want to clear ALL data for a new event? This will delete all ratings, questions, chat messages, lead registrations, AND bookings from the database.')) {
      return;
    }

    try {
      // Clear all ratings
      const { error: ratingsError } = await supabase
        .from('ratings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (ratingsError) {
        console.error('Error clearing ratings:', ratingsError);
        hookToast({
          title: "Error",
          description: "Failed to clear ratings.",
          variant: "destructive",
        });
        return;
      }

      // Clear all questions
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (questionsError) {
        console.error('Error clearing questions:', questionsError);
        hookToast({
          title: "Error", 
          description: "Failed to clear questions.",
          variant: "destructive",
        });
        return;
      }

      // Clear all chat messages
      const { error: chatError } = await supabase
        .from('chat_messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (chatError) {
        console.error('Error clearing chat:', chatError);
        hookToast({
          title: "Error",
          description: "Failed to clear chat messages.", 
          variant: "destructive",
        });
        return;
      }

      // Clear all lead registrations
      const { error: leadsError } = await supabase
        .from('leads')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (leadsError) {
        console.error('Error clearing leads:', leadsError);
        hookToast({
          title: "Error",
          description: "Failed to clear lead registrations.", 
          variant: "destructive",
        });
        return;
      }

      // Clear all bookings
      const { error: bookingsError } = await supabase
        .from('bookings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (bookingsError) {
        console.error('Error clearing bookings:', bookingsError);
        hookToast({
          title: "Error",
          description: "Failed to clear bookings.", 
          variant: "destructive",
        });
        return;
      }

      // Clear all time slots
      const { error: timeSlotsError } = await supabase
        .from('time_slots')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (timeSlotsError) {
        console.error('Error clearing time slots:', timeSlotsError);
        hookToast({
          title: "Error",
          description: "Failed to clear time slots.", 
          variant: "destructive",
        });
        return;
      }

      // Clear local state
      setLeads([]);
      setFilteredLeads([]);
      setStats({
        total: 0,
        today: 0,
        thisWeek: 0,
        recent: []
      });

      hookToast({
        title: "🎉 Ready for New Event!",
        description: "All ratings, questions, chat messages, lead registrations, and bookings cleared.",
      });
    } catch (error) {
      console.error('Exception while clearing all data:', error);
      hookToast({
        title: "Error",
        description: "An error occurred while clearing data.",
        variant: "destructive",
      });
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads(data || []);
      setFilteredLeads(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (leadsData: Lead[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayLeads = leadsData.filter(lead => 
      new Date(lead.created_at) >= today
    ).length;

    const weekLeads = leadsData.filter(lead => 
      new Date(lead.created_at) >= weekAgo
    ).length;

    setStats({
      total: leadsData.length,
      today: todayLeads,
      thisWeek: weekLeads,
      recent: leadsData.slice(0, 5)
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter(lead => 
      lead.name.toLowerCase().includes(term.toLowerCase()) ||
      lead.email.toLowerCase().includes(term.toLowerCase()) ||
      lead.job_title.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredLeads(filtered);
  };

  const deleteLead = async (leadId: string, leadName: string) => {
    if (!confirm(`Are you sure you want to delete the submission from ${leadName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
      const updatedLeads = leads.filter(lead => lead.id !== leadId);
      setLeads(updatedLeads);
      setFilteredLeads(updatedLeads.filter(lead => 
        !searchTerm || 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.job_title.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      calculateStats(updatedLeads);
      
      toast.success("Submission deleted successfully!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete submission");
    }
  };

  const bulkDeleteLeads = async () => {
    if (leads.length === 0) {
      toast.error('No leads to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL ${leads.length} leads? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) throw error;

      // Update local state
      setLeads([]);
      setFilteredLeads([]);
      calculateStats([]);
      
      toast.success('All leads deleted successfully');
    } catch (error) {
      console.error('Error deleting leads:', error);
      toast.error('Failed to delete leads');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Job Title', 'Registration Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name}"`,
        `"${lead.email}"`,
        `"${lead.job_title}"`,
        `"${format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm:ss')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `conference-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Leads exported successfully!");
  };

  // Auto-refresh every 30 seconds (only when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
      const interval = setInterval(fetchLeads, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Real-time subscription (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const channel = (supabase as any)
      .channel('leads-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload: any) => {
          console.log('New lead:', payload.new);
          fetchLeads(); // Refresh the list
          toast.success("New lead registered!");
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
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Access Required</CardTitle>
            <p className="text-muted-foreground">Enter password to access dashboard</p>
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
                Access Dashboard
              </Button>
            </form>
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
          <h1 className="text-3xl font-bold">Conference Lead Dashboard</h1>
          <p className="text-muted-foreground">Real-time lead collection and management</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/schedule">
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
            >
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Button>
          </Link>
            <Button 
              onClick={() => setShowModerationDashboard(!showModerationDashboard)}
              variant="outline" 
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              🛡️ Security
            </Button>
          <Button 
            onClick={handleClearAllForNewEvent}
            variant="outline" 
            size="sm"
            className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            🎉 New Event
          </Button>
          <Button onClick={fetchLeads} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security/Moderation Dashboard */}
      {showModerationDashboard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛡️ Security & Moderation Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ModerationDashboard />
          </CardContent>
        </Card>
      )}

      {/* Scheduling Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduling Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="scheduling-toggle"
                checked={schedulingEnabled}
                onCheckedChange={toggleScheduling}
              />
              <Label htmlFor="scheduling-toggle" className="text-sm font-medium">
                Enable time slot booking for leads
              </Label>
            </div>
            <Badge variant={schedulingEnabled ? "default" : "secondary"}>
              {schedulingEnabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowScheduleManager(!showScheduleManager)}
              variant="outline"
              size="sm"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {showScheduleManager ? "Hide" : "Manage"} Time Slots
            </Button>
          </div>

          {showScheduleManager && (
            <div className="border-t pt-4">
              <ScheduleManager />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-sm text-muted-foreground">Today's Signups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lead Management</CardTitle>
            {leads.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={bulkDeleteLeads}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Leads
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Leads Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No leads found matching your search." : "No leads collected yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.job_title}</TableCell>
                      <TableCell>
                        {format(new Date(lead.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Registered</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteLead(lead.id, lead.name)}
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
              Showing {filteredLeads.length} of {leads.length} leads
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}