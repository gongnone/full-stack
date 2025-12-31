import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ChevronDown, ChevronUp, Quote, Lightbulb, BookOpen } from 'lucide-react';

interface Theme {
  title: string;
  description: string;
  hooks: string[];
  storyElements?: {
    problem?: string;
    journey?: string;
    lesson?: string;
  };
}

interface ThemeListProps {
  themes: Theme[];
}

export function ThemeList({ themes }: ThemeListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!themes || themes.length === 0) {
    return (
      <div className="p-8 text-center bg-[#1A1F26] border border-[#2A3038] rounded-xl">
        <p className="text-[#8B98A5]">No themes extracted yet. Processing your source...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-5 w-5 text-[#FFAD1F]" />
        <h3 className="text-lg font-bold text-[#E7E9EA]">Key Themes Extracted</h3>
      </div>
      
      {themes.map((theme, index) => (
        <Card 
          key={index}
          className="bg-[#1A1F26] border-[#2A3038] overflow-hidden"
        >
          <button
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            className="w-full text-left"
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0] text-xs font-bold">
                  {index + 1}
                </span>
                <CardTitle className="text-md font-semibold text-[#E7E9EA]">
                  {theme.title}
                </CardTitle>
              </div>
              {expandedIndex === index ? (
                <ChevronUp className="h-5 w-5 text-[#8B98A5]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#8B98A5]" />
              )}
            </CardHeader>
          </button>

          {expandedIndex === index && (
            <CardContent className="p-4 pt-0 border-t border-[#2A3038]/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-[#E7E9EA] leading-relaxed">
                {theme.description}
              </p>

              {theme.storyElements && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {theme.storyElements.problem && (
                    <div className="bg-[#0F1419] p-2 rounded border border-[#2A3038]">
                      <span className="text-[10px] uppercase font-bold text-[#F4212E] block mb-1">Problem</span>
                      <p className="text-xs text-[#8B98A5]">{theme.storyElements.problem}</p>
                    </div>
                  )}
                  {theme.storyElements.journey && (
                    <div className="bg-[#0F1419] p-2 rounded border border-[#2A3038]">
                      <span className="text-[10px] uppercase font-bold text-[#1D9BF0] block mb-1">Journey</span>
                      <p className="text-xs text-[#8B98A5]">{theme.storyElements.journey}</p>
                    </div>
                  )}
                  {theme.storyElements.lesson && (
                    <div className="bg-[#0F1419] p-2 rounded border border-[#2A3038]">
                      <span className="text-[10px] uppercase font-bold text-[#00D26A] block mb-1">Lesson</span>
                      <p className="text-xs text-[#8B98A5]">{theme.storyElements.lesson}</p>
                    </div>
                  )}
                </div>
              )}

              {theme.hooks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8B98A5] uppercase tracking-wider">
                    <Quote className="h-3 w-3" /> Potential Hooks
                  </div>
                  <ul className="space-y-1">
                    {theme.hooks.map((hook, i) => (
                      <li key={i} className="text-xs text-[#8B98A5] pl-4 border-l border-[#2A3038]">
                        "{hook}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
