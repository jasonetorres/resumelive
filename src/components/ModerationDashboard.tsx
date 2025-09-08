import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Ban, CheckCircle, XCircle, AlertTriangle, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BlockedEmail {
  id: string;
  email: string;
  domain: string | null;
  reason: string | null;
  created_at: string;
}

interface ModerationLog {
  id: string;
  action_type: string;
  target_id: string | null;
  target_type: string | null;
  reason: string | null;
  moderator: string | null;
  metadata: any;
  created_at: string;
}

interface PendingLead {
  id: string;
  name: string;
  email: string;
  job_title: string;
  approval_status: string;
  created_at: string;
}

export function ModerationDashboard() {
  const [blockedEmails, setBlockedEmails] = useState<BlockedEmail[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [pendingLeads, setPendingLeads] = useState<PendingLead[]>([]);
  const [newBlockedEmail, setNewBlockedEmail] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch blocked emails
      const { data: emails } = await supabase
        .from('blocked_emails')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch moderation logs
      const { data: logs } = await supabase
        .from('moderation_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Fetch pending leads
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      setBlockedEmails(emails || []);
      setModerationLogs(logs || []);
      setPendingLeads(leads || []);
    } catch (error) {
      console.error('Error fetching moderation data:', error);
      toast.error('Failed to load moderation data');
    } finally {
      setIsLoading(false);
    }
  };

  const blockEmail = async () => {
    if (!newBlockedEmail.trim()) return;

    try {
      const domain = newBlockedEmail.includes('@') ? newBlockedEmail.split('@')[1] : null;
      
      const { error } = await supabase
        .from('blocked_emails')
        .insert({
          email: newBlockedEmail.trim(),
          domain: domain,
          reason: blockReason.trim() || 'Manually blocked'
        });

      if (error) throw error;

      toast.success('Email blocked successfully');
      setNewBlockedEmail('');
      setBlockReason('');
      fetchData();
    } catch (error) {
      console.error('Error blocking email:', error);
      toast.error('Failed to block email');
    }
  };

  const unblockEmail = async (id: string, email: string) => {
    try {
      const { error } = await supabase
        .from('blocked_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(`Unblocked ${email}`);
      fetchData();
    } catch (error) {
      console.error('Error unblocking email:', error);
      toast.error('Failed to unblock email');
    }
  };

  const approveLead = async (leadId: string, leadName: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ approval_status: 'approved' })
        .eq('id', leadId);

      if (error) throw error;

      toast.success(`Approved ${leadName}`);
      fetchData();
    } catch (error) {
      console.error('Error approving lead:', error);
      toast.error('Failed to approve lead');
    }
  };

  const rejectLead = async (leadId: string, leadName: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ approval_status: 'rejected' })
        .eq('id', leadId);

      if (error) throw error;

      toast.success(`Rejected ${leadName}`);
      fetchData();
    } catch (error) {
      console.error('Error rejecting lead:', error);
      toast.error('Failed to reject lead');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading moderation data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Content Moderation</h2>
      </div>

      <Tabs defaultValue="blocked-emails" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blocked-emails">Blocked Emails</TabsTrigger>
          <TabsTrigger value="pending-leads">Pending Approval</TabsTrigger>
          <TabsTrigger value="logs">Moderation Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="blocked-emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Block New Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Email or domain to block"
                  value={newBlockedEmail}
                  onChange={(e) => setNewBlockedEmail(e.target.value)}
                />
                <Input
                  placeholder="Reason (optional)"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
                <Button onClick={blockEmail} disabled={!newBlockedEmail.trim()}>
                  <Ban className="w-4 h-4 mr-2" />
                  Block Email
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blocked Emails ({blockedEmails.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {blockedEmails.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No blocked emails</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email/Domain</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Blocked Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedEmails.map((blocked) => (
                      <TableRow key={blocked.id}>
                        <TableCell className="font-mono">{blocked.email}</TableCell>
                        <TableCell>{blocked.reason || 'No reason provided'}</TableCell>
                        <TableCell>{format(new Date(blocked.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Unblock
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Unblock Email</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to unblock {blocked.email}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => unblockEmail(blocked.id, blocked.email)}>
                                  Unblock
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leads Pending Approval ({pendingLeads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLeads.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No leads pending approval</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell className="font-mono">{lead.email}</TableCell>
                        <TableCell>{lead.job_title}</TableCell>
                        <TableCell>{format(new Date(lead.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveLead(lead.id, lead.name)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectLead(lead.id, lead.name)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Moderation Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {moderationLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No moderation activity</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moderationLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {log.action_type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.target_type}: {log.target_id?.substring(0, 20)}...
                        </TableCell>
                        <TableCell>{log.reason}</TableCell>
                        <TableCell>
                          {log.metadata?.severity && (
                            <Badge className={getSeverityColor(log.metadata.severity)}>
                              {log.metadata.severity}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(log.created_at), 'MMM dd, HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}