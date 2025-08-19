import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Search, RefreshCw, Users, Calendar, TrendingUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    recent: []
  });

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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time subscription
  useEffect(() => {
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
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Conference Lead Dashboard</h1>
          <p className="text-muted-foreground">Real-time lead collection and management</p>
        </div>
        <Button onClick={fetchLeads} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

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
          <CardTitle>Lead Management</CardTitle>
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