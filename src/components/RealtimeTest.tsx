import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface RealtimeStatus {
  table: string;
  connected: boolean;
  lastEvent?: string;
  eventCount: number;
  status: 'testing' | 'success' | 'error' | 'idle';
}

const REALTIME_TABLES = [
  'bookings',
  'chat_messages', 
  'current_target',
  'leads',
  'question_upvotes',
  'questions',
  'ratings',
  'resumes',
  'scheduling_settings',
  'time_slots'
];

export function RealtimeTest() {
  const [tableStatuses, setTableStatuses] = useState<Record<string, RealtimeStatus>>({});
  const [isTestRunning, setIsTestRunning] = useState(false);

  useEffect(() => {
    // Initialize all table statuses
    const initialStatuses: Record<string, RealtimeStatus> = {};
    REALTIME_TABLES.forEach(table => {
      initialStatuses[table] = {
        table,
        connected: false,
        eventCount: 0,
        status: 'idle'
      };
    });
    setTableStatuses(initialStatuses);
  }, []);

  const testRealtimeConnection = async (tableName: string) => {
    console.log(`Testing realtime for table: ${tableName}`);
    
    setTableStatuses(prev => ({
      ...prev,
      [tableName]: { ...prev[tableName], status: 'testing' }
    }));

    try {
      const channel = supabase
        .channel(`test-${tableName}-${Date.now()}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: tableName
        }, (payload) => {
          console.log(`Realtime event received for ${tableName}:`, payload);
          setTableStatuses(prev => ({
            ...prev,
            [tableName]: {
              ...prev[tableName],
              connected: true,
              lastEvent: payload.eventType || 'unknown',
              eventCount: prev[tableName].eventCount + 1,
              status: 'success'
            }
          }));
        })
        .subscribe((status) => {
          console.log(`Subscription status for ${tableName}:`, status);
          if (status === 'SUBSCRIBED') {
            setTableStatuses(prev => ({
              ...prev,
              [tableName]: {
                ...prev[tableName],
                connected: true,
                status: 'success'
              }
            }));
          } else if (status === 'CHANNEL_ERROR') {
            setTableStatuses(prev => ({
              ...prev,
              [tableName]: {
                ...prev[tableName],
                connected: false,
                status: 'error'
              }
            }));
          }
        });

      // Clean up after 5 seconds
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 5000);

    } catch (error) {
      console.error(`Error testing ${tableName}:`, error);
      setTableStatuses(prev => ({
        ...prev,
        [tableName]: {
          ...prev[tableName],
          connected: false,
          status: 'error'
        }
      }));
    }
  };

  const testAllTables = async () => {
    setIsTestRunning(true);
    
    // Reset all statuses
    setTableStatuses(prev => {
      const reset: Record<string, RealtimeStatus> = {};
      REALTIME_TABLES.forEach(table => {
        reset[table] = {
          table,
          connected: false,
          eventCount: 0,
          status: 'idle'
        };
      });
      return reset;
    });

    // Test all tables
    for (const table of REALTIME_TABLES) {
      await testRealtimeConnection(table);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setTimeout(() => {
      setIsTestRunning(false);
    }, 6000);
  };

  const getStatusIcon = (status: RealtimeStatus['status']) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: RealtimeStatus['status']) => {
    switch (status) {
      case 'testing':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const successCount = Object.values(tableStatuses).filter(s => s.status === 'success').length;
  const totalTables = REALTIME_TABLES.length;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Realtime Connection Test</CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {successCount}/{totalTables} Connected
            </Badge>
            <Button 
              onClick={testAllTables} 
              disabled={isTestRunning}
              size="sm"
            >
              {isTestRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test All Tables'
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REALTIME_TABLES.map((table) => {
            const status = tableStatuses[table];
            if (!status) return null;

            return (
              <Card key={table} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{table}</h4>
                    {getStatusIcon(status.status)}
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${getStatusColor(status.status)}`}
                      />
                      <span>
                        {status.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    
                    {status.lastEvent && (
                      <div>Last event: {status.lastEvent}</div>
                    )}
                    
                    {status.eventCount > 0 && (
                      <div>Events received: {status.eventCount}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Test Instructions:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Click "Test All Tables" to check realtime connections</li>
            <li>• Green = Successfully connected and ready for realtime events</li>
            <li>• Blue = Currently testing connection</li>
            <li>• Red = Connection failed or error occurred</li>
            <li>• To fully test, try making changes to the database and watch for live events</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}