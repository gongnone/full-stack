import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Check } from 'lucide-react';

interface ButtonChoiceProps {
  options: string[];
  selected?: string | string[];
  multiSelect?: boolean;
  onSelect: (value: string | string[]) => void;
}

export function ButtonChoice({ options, selected, multiSelect, onSelect }: ButtonChoiceProps) {
  const handleSelect = (option: string) => {
    if (multiSelect) {
      const current = Array.isArray(selected) ? selected : [];
      if (current.includes(option)) {
        onSelect(current.filter(o => o !== option));
      } else {
        onSelect([...current, option]);
      }
    } else {
      onSelect(option);
    }
  };

  const isSelected = (option: string) => {
    if (multiSelect) {
      return Array.isArray(selected) && selected.includes(option);
    }
    return selected === option;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          className={`
            relative flex items-center justify-between p-4 rounded-xl border text-left transition-all
            ${isSelected(option) 
              ? 'bg-[#1D9BF0]/10 border-[#1D9BF0] text-[#1D9BF0]' 
              : 'bg-[#1A1F26] border-[#2A3038] text-[#E7E9EA] hover:bg-[#2A3038]'
            }
          `}
        >
          <span className="font-medium">{option}</span>
          {isSelected(option) && <Check className="h-5 w-5" />}
        </button>
      ))}
    </div>
  );
}

interface AudienceFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function AudienceForm({ onSubmit, initialData = {} }: AudienceFormProps) {
  const [step, setStep] = useState<'age' | 'industry' | 'goals' | 'pain'>('age');
  const [data, setData] = useState(initialData);

  const updateData = (key: string, value: any) => {
    setData({ ...data, [key]: value });
  };

  return (
    <div className="space-y-8">
      {step === 'age' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-semibold text-[#E7E9EA]">What is the primary age range?</h3>
          <ButtonChoice 
            options={['18-24', '25-34', '35-44', '45-54', '55+']}
            selected={data.ageRange}
            onSelect={(val) => {
              updateData('ageRange', val);
              setStep('industry');
            }}
          />
        </div>
      )}

      {step === 'industry' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-semibold text-[#E7E9EA]">Which industries do they work in?</h3>
          <ButtonChoice 
            multiSelect
            options={['Tech / SaaS', 'E-commerce', 'Creator Economy', 'Health & Wellness', 'Finance', 'Education', 'Real Estate']}
            selected={data.industries}
            onSelect={(val) => updateData('industries', val)}
          />
          <Button 
            className="w-full mt-4" 
            onClick={() => setStep('goals')}
            disabled={!data.industries?.length}
          >
            Next: Goals
          </Button>
        </div>
      )}

      {step === 'goals' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-semibold text-[#E7E9EA]">What are their main aspirations?</h3>
          <ButtonChoice 
            multiSelect
            options={['Scale Revenue', 'Build Authority', 'Save Time', 'Find Community', 'Learn Skills', 'Work-Life Balance']}
            selected={data.goals}
            onSelect={(val) => updateData('goals', val)}
          />
          <Button 
            className="w-full mt-4" 
            onClick={() => setStep('pain')}
            disabled={!data.goals?.length}
          >
            Next: Pain Points
          </Button>
        </div>
      )}

      {step === 'pain' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-semibold text-[#E7E9EA]">What keeps them up at night?</h3>
          <ButtonChoice 
            multiSelect
            options={['Overwhelm / Burnout', 'Lack of Growth', 'Tech Headaches', 'Imposter Syndrome', 'Competition', 'Budget Constraints']}
            selected={data.painPoints}
            onSelect={(val) => updateData('painPoints', val)}
          />
          <Button 
            className="w-full mt-4 bg-[#00D26A] hover:bg-[#00B85E] text-white" 
            onClick={() => onSubmit(data)}
            disabled={!data.painPoints?.length}
          >
            Generate Persona
          </Button>
        </div>
      )}
    </div>
  );
}
