import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Search, Plus, Filter, MoreHorizontal } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface Client {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived';
  industry: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  brandColor: string;
  createdAt: number;
  dnaStatus?: 'not_started' | 'in_progress' | 'complete';
  dnaProgress?: number;
}

interface ClientListProps {
  clients: Client[];
  onCreateClick: () => void;
}

export function ClientList({ clients, onCreateClick }: ClientListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) || 
                          (client.contactEmail && client.contactEmail.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B98A5]" />
          <Input 
            placeholder="Search clients..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1A1F26] border-[#2A3038] text-[#E7E9EA]"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'paused' | 'archived')}
              className="h-10 pl-3 pr-8 bg-[#1A1F26] border border-[#2A3038] text-[#E7E9EA] text-sm rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-[#1D9BF0]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B98A5] pointer-events-none" />
          </div>

          <Button onClick={onCreateClick} className="bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Client
          </Button>
        </div>
      </div>

      {/* Client Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#2A3038] rounded-xl">
          <p className="text-[#8B98A5]">No clients found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="bg-[#1A1F26] border-[#2A3038] hover:border-[#8B98A5]/50 transition-colors group">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: client.brandColor || '#1D9BF0' }}
                  >
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-[#E7E9EA] group-hover:text-[#1D9BF0] transition-colors">
                      <Link to="/app/clients/$clientId/settings" params={{ clientId: client.id }}>{client.name}</Link>
                    </CardTitle>
                    <p className="text-xs text-[#8B98A5]">{client.industry || 'No industry set'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={`
                    ${client.status === 'active' ? 'border-[#00D26A] text-[#00D26A]' : 
                      client.status === 'paused' ? 'border-[#FFAD1F] text-[#FFAD1F]' : 
                      'border-[#8B98A5] text-[#8B98A5]'}
                  `}>
                    {client.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-[#8B98A5]">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8B98A5]">Contact</span>
                    <span className="text-[#E7E9EA]">{client.contactEmail || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B98A5]">Joined</span>
                    <span className="text-[#E7E9EA]">{new Date(client.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#2A3038] flex justify-between items-center">
                  <span className="text-xs text-[#8B98A5]">Brand DNA Status</span>
                  {client.dnaStatus === 'complete' ? (
                    <Badge className="bg-[#00D26A] text-white hover:bg-[#00B85E]">Complete</Badge>
                  ) : client.dnaStatus === 'in_progress' ? (
                    <Badge className="bg-[#FFAD1F] text-white hover:bg-[#E09612]">{client.dnaProgress}% Done</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-[#2A3038] text-[#8B98A5]">Not Started</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
