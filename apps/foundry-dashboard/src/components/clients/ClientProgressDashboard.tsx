import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertCircle } from 'lucide-react';

interface ClientProgress {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'complete';
  percentage: number;
  lastActivity: number;
  needsNudge: boolean;
}

interface ProgressDashboardProps {
  clients: ClientProgress[];
  onNudge: (clientId: string) => void;
}

export function ClientProgressDashboard({ clients, onNudge }: ProgressDashboardProps) {
  const notStarted = clients.filter(c => c.status === 'not_started');
  const inProgress = clients.filter(c => c.status === 'in_progress');
  const completed = clients.filter(c => c.status === 'complete');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1F26] border-[#2A3038]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#8B98A5]">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#E7E9EA]">{notStarted.length}</div>
            <p className="text-xs text-[#8B98A5]">Not started yet</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F26] border-[#2A3038]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#8B98A5]">Active Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#FFAD1F]">{inProgress.length}</div>
            <p className="text-xs text-[#8B98A5]">In progress</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F26] border-[#2A3038]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#8B98A5]">Ready for Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00D26A]">{completed.length}</div>
            <p className="text-xs text-[#8B98A5]">Brand DNA Complete</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#E7E9EA]">Active Clients</h3>
        {inProgress.length === 0 && (
          <p className="text-[#8B98A5] italic">No clients currently onboarding.</p>
        )}
        {inProgress.map(client => (
          <div key={client.id} className="flex items-center justify-between p-4 bg-[#1A1F26] border border-[#2A3038] rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#2A3038] flex items-center justify-center text-white font-bold">
                {client.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-[#E7E9EA] flex items-center gap-2">
                  {client.name}
                  {client.needsNudge && (
                    <Badge variant="outline" className="border-[#F4212E] text-[#F4212E] gap-1 text-[10px]">
                      <AlertCircle className="h-3 w-3" /> Stalled 7+ days
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-1.5 bg-[#0F1419] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFAD1F]" style={{ width: `${client.percentage}%` }} />
                  </div>
                  <span className="text-xs text-[#8B98A5]">{client.percentage}% Complete</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-[#8B98A5]">Last Activity</p>
                <p className="text-sm text-[#E7E9EA]">{new Date(client.lastActivity).toLocaleDateString()}</p>
              </div>
              {client.needsNudge && (
                <Button size="sm" variant="outline" onClick={() => onNudge(client.id)} className="border-[#F4212E] text-[#F4212E] hover:bg-[#F4212E]/10">
                  Send Nudge
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
