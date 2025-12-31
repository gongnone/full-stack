import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit2, Check, RefreshCw, X } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';

interface Persona {
  id: string;
  name: string;
  summary: string | null;
  demographics: {
    ageRange: string | null;
    occupation: string | null;
    location: string | null;
  };
  psychographics: {
    painPoints: string[];
    goals: string[];
    interests: string[];
  };
  contentPreferences: {
    preferredPlatforms: string[];
    contentTypes: string[];
  };
}

interface PersonaCardProps {
  persona: Persona;
  onApprove: (id: string) => void;
  onEdit: (id: string, updates: Partial<Persona>) => void;
  onRegenerate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PersonaCard({ persona, onApprove, onEdit, onRegenerate, onDelete }: PersonaCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<Persona>(persona);

  const handleSave = () => {
    onEdit(persona.id, editState);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditState(persona);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-[#2A3038] bg-[#1A1F26] text-[#E7E9EA]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Input 
            value={editState.name} 
            onChange={(e) => setEditState({...editState, name: e.target.value})}
            className="text-lg font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0 text-[#00D26A]">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0 text-[#F4212E]">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-xs text-[#8B98A5] uppercase tracking-wider">Summary</label>
            <Textarea 
              value={editState.summary || ''} 
              onChange={(e) => setEditState({...editState, summary: e.target.value})}
              className="bg-[#0F1419] border-[#2A3038] min-h-[80px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-[#8B98A5] uppercase tracking-wider">Demographics</label>
              <Input 
                placeholder="Age Range"
                value={editState.demographics.ageRange || ''}
                onChange={(e) => setEditState({
                  ...editState, 
                  demographics: {...editState.demographics, ageRange: e.target.value}
                })}
                className="bg-[#0F1419] border-[#2A3038] h-8 text-sm"
              />
              <Input 
                placeholder="Occupation"
                value={editState.demographics.occupation || ''}
                onChange={(e) => setEditState({
                  ...editState, 
                  demographics: {...editState.demographics, occupation: e.target.value}
                })}
                className="bg-[#0F1419] border-[#2A3038] h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#8B98A5] uppercase tracking-wider">Pain Points (comma sep)</label>
              <Textarea 
                value={editState.psychographics.painPoints.join(', ')}
                onChange={(e) => setEditState({
                  ...editState, 
                  psychographics: {...editState.psychographics, painPoints: e.target.value.split(',').map(s => s.trim())}
                })}
                className="bg-[#0F1419] border-[#2A3038] min-h-[80px] text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#2A3038] bg-[#1A1F26] text-[#E7E9EA] hover:border-[#1D9BF0]/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{persona.name}</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0 text-[#8B98A5] hover:text-[#E7E9EA]">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onRegenerate(persona.id)} className="h-8 w-8 p-0 text-[#8B98A5] hover:text-[#1D9BF0]">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {persona.summary && (
          <p className="text-sm text-[#8B98A5] italic">"{persona.summary}"</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs text-[#8B98A5] uppercase tracking-wider mb-2">Demographics</h4>
            <ul className="text-sm space-y-1">
              {persona.demographics.ageRange && <li>• {persona.demographics.ageRange}</li>}
              {persona.demographics.occupation && <li>• {persona.demographics.occupation}</li>}
              {persona.demographics.location && <li>• {persona.demographics.location}</li>}
            </ul>
          </div>
          <div>
            <h4 className="text-xs text-[#8B98A5] uppercase tracking-wider mb-2">Pain Points</h4>
            <ul className="text-sm space-y-1">
              {persona.psychographics.painPoints.slice(0, 3).map((point, i) => (
                <li key={i} className="line-clamp-1">• {point}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="text-xs text-[#8B98A5] uppercase tracking-wider mb-2">Preferred Platforms</h4>
          <div className="flex flex-wrap gap-2">
            {persona.contentPreferences.preferredPlatforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="bg-[#2A3038] text-[#E7E9EA] hover:bg-[#3A4048]">
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={() => onDelete(persona.id)} className="text-[#F4212E] hover:text-[#F4212E] hover:bg-[#F4212E]/10">
          Delete
        </Button>
        <Button onClick={() => onApprove(persona.id)} className="bg-[#00D26A] text-white hover:bg-[#00B85E]">
          Approve Persona
        </Button>
      </CardFooter>
    </Card>
  );
}
