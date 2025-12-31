import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';

interface Pillar {
  id: string;
  title: string;
  description: string;
  frameworkType: 'catalyst' | 'core_truth' | 'proof';
  rationale: {
    audiencePain: string;
    marketGap: string;
    voiceConnection: string;
  } | null;
  status: 'proposed' | 'approved' | 'rejected';
}

interface PillarProposalProps {
  pillars: Pillar[];
  onApprove: (id: string) => void;
  onApproveAll: () => void;
  onEdit: (id: string, updates: { title?: string; description?: string }) => void;
  onRegenerate: (id: string) => void;
  isRegenerating?: string | null;
}

export function PillarProposal({ 
  pillars, 
  onApprove, 
  onApproveAll, 
  onEdit, 
  onRegenerate,
  isRegenerating 
}: PillarProposalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<{ title: string; description: string }>({ title: '', description: '' });

  const startEditing = (pillar: Pillar) => {
    setEditingId(pillar.id);
    setEditState({ title: pillar.title, description: pillar.description });
  };

  const saveEdit = (id: string) => {
    onEdit(id, editState);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#E7E9EA]">Strategic Content Pillars</h2>
          <p className="text-sm text-[#8B98A5]">Based on your brand DNA and audience analysis</p>
        </div>
        <Button onClick={onApproveAll} className="bg-[#00D26A] hover:bg-[#00B85E] text-white">
          Approve All Pillars
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pillars.map((pillar) => (
          <Card 
            key={pillar.id} 
            className={`bg-[#1A1F26] border-[#2A3038] ${pillar.status === 'approved' ? 'border-[#00D26A]' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                {editingId === pillar.id ? (
                  <Input 
                    value={editState.title}
                    onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                    className="font-bold text-lg bg-[#0F1419] border-[#2A3038]"
                  />
                ) : (
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-[#E7E9EA]">{pillar.title}</CardTitle>
                    <Badge variant="outline" className="border-[#2A3038] text-[#8B98A5]">
                      {pillar.frameworkType.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                )}
                
                {pillar.status === 'approved' && (
                  <Badge className="bg-[#00D26A] text-white flex gap-1 items-center">
                    <Check className="h-3 w-3" /> Approved
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {editingId === pillar.id ? (
                <Textarea 
                  value={editState.description}
                  onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                  className="bg-[#0F1419] border-[#2A3038] min-h-[80px]"
                />
              ) : (
                <p className="text-sm text-[#E7E9EA]">{pillar.description}</p>
              )}

              {/* Rationale Section - Collapsible or Always Visible? Always visible for MVP transparency */}
              {pillar.rationale && (
                <div className="bg-[#0F1419] p-3 rounded-lg space-y-2 text-xs border border-[#2A3038]/50">
                  <div className="flex gap-2">
                    <span className="font-semibold text-[#1D9BF0] min-w-[80px]">Market Gap:</span>
                    <span className="text-[#8B98A5]">{pillar.rationale.marketGap}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-[#F4212E] min-w-[80px]">Pain Point:</span>
                    <span className="text-[#8B98A5]">{pillar.rationale.audiencePain}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-[#00D26A] min-w-[80px]">Your Voice:</span>
                    <span className="text-[#8B98A5]">{pillar.rationale.voiceConnection}</span>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end gap-2 pt-2 border-t border-[#2A3038]">
              {editingId === pillar.id ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => saveEdit(pillar.id)} className="bg-[#1D9BF0] text-white">Save</Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => startEditing(pillar)}
                    disabled={pillar.status === 'approved'}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRegenerate(pillar.id)}
                    disabled={isRegenerating === pillar.id || pillar.status === 'approved'}
                    className="text-[#8B98A5] hover:text-[#1D9BF0]"
                  >
                    {isRegenerating === pillar.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1"><RefreshCw className="h-4 w-4" /> Regenerate</div>
                    )}
                  </Button>
                  {pillar.status !== 'approved' && (
                    <Button 
                      size="sm" 
                      onClick={() => onApprove(pillar.id)}
                      className="bg-[#2A3038] hover:bg-[#00D26A] hover:text-white transition-colors"
                    >
                      Approve
                    </Button>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
