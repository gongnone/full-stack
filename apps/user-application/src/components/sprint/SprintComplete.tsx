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

  const clientId = 'temp-client-id'; // TODO: Get from auth context (Rule 1: Isolation)

  

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

      className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground"

    >

      {/* AC1: Success Icon with 72px checkmark and green celebration glow */}

      <motion.div

        initial={{ scale: 0 }}

        animate={{ scale: 1 }}

        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}

        className="relative mb-8"

      >

        <div className="absolute inset-0 bg-success/20 rounded-full blur-[60px] animate-pulse" />

        <CheckCircle2 className="h-24 w-24 text-success relative z-10 drop-shadow-[0_0_20px_var(--color-success)]" />

      </motion.div>



      {/* AC1: Title 32px */}

      <motion.h1

        initial={{ opacity: 0, y: 20 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ delay: 0.3 }}

        className="text-[40px] font-bold text-foreground mb-8 tracking-tighter"

      >

        Sprint Complete!

      </motion.h1>



      {/* AC1: Hero Stat 64px */}

      <motion.div

        initial={{ opacity: 0, y: 20 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ delay: 0.4 }}

        className="text-center mb-16"

      >

        <div className="text-8xl font-black text-success font-mono tracking-tighter mb-2">

          {hoursSaved}<span className="text-4xl ml-2 text-success/50 font-sans uppercase">Hrs</span>

        </div>

        <div className="text-muted-foreground text-2xl font-medium tracking-tight">manual work saved</div>

        <div className="text-success/60 font-mono text-sm mt-3 uppercase tracking-widest font-bold">

          (${dollarValue} at $200/hr)

        </div>

      </motion.div>



      {/* AC2: Stats Grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mb-16">

        <Card className="bg-card/40 border-border shadow-xl">

          <CardContent className="p-8">

            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8 border-b border-border pb-2">Performance Metrics</h3>

            <div className="grid grid-cols-2 gap-y-10">

              <StatItem label="Reviewed" value={stats.total} />

              <StatItem label="Approved" value={stats.approved} percent={Math.round((stats.approved / (stats.total || 1)) * 100)} color="approve" />

              <StatItem label="Killed" value={stats.killed} percent={Math.round((stats.killed / (stats.total || 1)) * 100)} color="kill" />

              <StatItem label="Avg Decision" value={`${(stats.averageDecisionTime / 1000).toFixed(1)}s`} color="muted" />

            </div>

          </CardContent>

        </Card>



        {/* AC3: Zero-Edit Rate */}

        <Card className="bg-card/40 border-border flex flex-col justify-center shadow-xl">

          <CardContent className="p-8">

            <div className="flex justify-between items-end mb-6">

              <div>

                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Zero-Edit Rate</h3>

                <p className="text-xs text-muted-foreground font-mono">TARGET: 60%</p>

              </div>

              <div className={`text-5xl font-black font-mono tracking-tighter ${zeroEditRate >= 60 ? 'text-success' : 'text-warning'}`}>

                {zeroEditRate}%

              </div>

            </div>

            

            <div className="relative h-5 bg-secondary rounded-full overflow-hidden mb-4 shadow-inner">

              <motion.div

                className={`h-full ${zeroEditRate >= 60 ? 'bg-success shadow-[0_0_15px_var(--color-success)]' : 'bg-warning'}`}

                initial={{ width: 0 }}

                animate={{ width: `${zeroEditRate}%` }}

                transition={{ delay: 0.7, duration: 1.2, ease: 'circOut' }}

              />

              {/* Target Marker at 60% */}

              <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-foreground/20 z-10" />

            </div>

            <p className={`text-[10px] text-center uppercase font-black tracking-widest ${zeroEditRate >= 60 ? 'text-success' : 'text-warning'}`}>

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

        className="flex flex-wrap justify-center gap-6"

      >

        <Button

          variant="outline"

          className="bg-card border-border text-foreground hover:bg-secondary rounded-xl px-8 h-12 font-bold shadow-lg"

          onClick={() => setIsExportModalOpen(true)}

        >

          <Download className="h-4 w-4 mr-2" />

          Export Approved

        </Button>



        <Button

          variant="outline"

          className="bg-card border-border text-foreground hover:bg-secondary rounded-xl px-8 h-12 font-bold shadow-lg"

          onClick={handleShare}

        >

          <Share2 className="h-4 w-4 mr-2" />

          Share Summary

        </Button>



        <Button

          variant="outline"

          className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl px-8 h-12 font-bold shadow-lg"

          onClick={() => navigate({ to: '/app/creative-conflicts' as any })}

        >

          <Flame className="h-4 w-4 mr-2" />

          Review Conflicts

        </Button>



        <Button

          onClick={onExit}

          className="bg-success hover:bg-success/90 text-white font-black px-10 h-12 rounded-xl shadow-xl shadow-success/20 transition-all duration-200 uppercase tracking-widest text-xs"

        >

          <LayoutDashboard className="h-4 w-4 mr-2" />

          Dashboard

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

  approve: 'text-success',

  kill: 'text-destructive',

  edit: 'text-info',

  warning: 'text-warning',

  muted: 'text-foreground',

};



function StatItem({ label, value, percent, color }: StatItemProps) {

  return (

    <div className="group">

      <div className={`text-3xl font-black font-mono tracking-tighter ${color ? statColors[color] : 'text-foreground'}`}>

        {value}{percent !== undefined && <span className="text-xs ml-1.5 opacity-40 font-sans uppercase font-bold">({percent}%)</span>}

      </div>

      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1 group-hover:text-foreground transition-colors">{label}</div>

    </div>

  );

}
