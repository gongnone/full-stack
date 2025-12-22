import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Share2, Flame, LayoutDashboard, Download } from 'lucide-react';
import type { SprintStats } from './types';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useState } from 'react';
import { ExportModal } from '../common/ExportModal';

interface SprintCompleteProps {
  stats: SprintStats;
  onExit: () => void;
}

export function SprintComplete({
  stats,
  onExit,
}: SprintCompleteProps) {
  const navigate = useNavigate();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const clientId = 'unknown'; // TODO: Get from auth context
  
  // AC3: Zero-Edit Rate (ZED) - Percentage of approved that required NO edits
  // For MVP, we'll assume stats.approved items are "clean" unless stats.edited > 0
  const zeroEditRate = stats.approved > 0
    ? Math.round(((stats.approved - stats.edited) / stats.approved) * 100)
    : 0;

  // AC1: Hero stats (Items * 6 mins saved per piece)
  const minutesSaved = stats.total * 6;
  const hoursSaved = (minutesSaved / 60).toFixed(1);
  const dollarValue = (parseFloat(hoursSaved) * 200).toLocaleString();

  const handleShare = () => {
    const summary = `🚀 Sprint Complete! I just reviewed ${stats.total} content pieces in ${Math.round((stats.averageDecisionTime * stats.total) / 1000)}s and saved ${hoursSaved} hours of manual work using Agentic Foundry.`;
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-950"
    >
      {/* AC1: Success Icon with 72px checkmark and green celebration glow */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-green-500/30 rounded-full blur-[40px] animate-pulse" />
        <CheckCircle2 className="h-24 w-24 text-green-500 relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
      </motion.div>

      {/* AC1: Title 32px */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-[32px] font-bold text-slate-100 mb-8 tracking-tight"
      >
        Sprint Complete!
      </motion.h1>

      {/* AC1: Hero Stat 64px */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-12"
      >
        <div className="text-7xl font-black text-green-500 font-mono tracking-tighter mb-2">
          {hoursSaved}<span className="text-3xl ml-2 text-green-500/70">HRS</span>
        </div>
        <div className="text-slate-400 text-xl font-medium">manual work saved</div>
        <div className="text-green-500/60 font-mono text-sm mt-2">
          (${dollarValue} at $200/hr)
        </div>
      </motion.div>

      {/* AC2: Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-y-8">
              <StatItem label="Reviewed" value={stats.total} />
              <StatItem label="Approved" value={stats.approved} percent={Math.round((stats.approved / (stats.total || 1)) * 100)} color="approve" />
              <StatItem label="Killed" value={stats.killed} percent={Math.round((stats.killed / (stats.total || 1)) * 100)} color="kill" />
              <StatItem label="Avg Decision" value={`${(stats.averageDecisionTime / 1000).toFixed(1)}s`} color="muted" />
            </div>
          </CardContent>
        </Card>

        {/* AC3: Zero-Edit Rate */}
        <Card className="bg-slate-900/40 border-slate-800 flex flex-col justify-center">
          <CardContent className="p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Zero-Edit Rate</h3>
                <p className="text-sm text-slate-400">Target: 60%</p>
              </div>
              <div className={`text-4xl font-black font-mono ${zeroEditRate >= 60 ? 'text-green-500' : 'text-yellow-500'}`}>
                {zeroEditRate}%
              </div>
            </div>
            
            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden mb-2">
              <motion.div
                className={`h-full ${zeroEditRate >= 60 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${zeroEditRate}%` }}
                transition={{ delay: 0.7, duration: 1, ease: 'circOut' }}
              />
              {/* Target Marker at 60% */}
              <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-white/30 z-10" />
            </div>
            <p className="text-[10px] text-slate-500 text-center uppercase font-bold tracking-tighter">
              {zeroEditRate >= 60 ? 'Exceeding Quality Target' : 'Below Quality Target'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AC4: Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <Button
          variant="outline"
          className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
          onClick={() => setIsExportModalOpen(true)}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Approved
        </Button>

        <Button
          variant="outline"
          className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Summary
        </Button>

        <Button
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          onClick={() => navigate({ to: '/app/creative-conflicts' as any })}
        >
          <Flame className="h-4 w-4 mr-2" />
          Review Conflicts
        </Button>

        <Button
          onClick={onExit}
          className="bg-green-600 hover:bg-green-500 text-white font-bold px-8"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </motion.div>

      <ExportModal 
        isOpen={isExportModalOpen} 
        onOpenChange={setIsExportModalOpen} 
        clientId={clientId} 
      />
    </motion.div>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
  percent?: number;
  color?: 'approve' | 'kill' | 'edit' | 'warning' | 'muted';
}

const statColors = {
  approve: 'text-green-500',
  kill: 'text-red-500',
  edit: 'text-blue-500',
  warning: 'text-yellow-500',
  muted: 'text-slate-100',
};

function StatItem({ label, value, percent, color }: StatItemProps) {
  return (
    <div>
      <div className={`text-2xl font-black font-mono ${color ? statColors[color] : 'text-slate-100'}`}>
        {value}{percent !== undefined && <span className="text-xs ml-1 opacity-50">({percent}%)</span>}
      </div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  );
}