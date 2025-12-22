import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Zap, ChevronDown, ChevronRight, Twitter, Linkedin, Copy, Bot, Video, Instagram, Mail, Layout, Layers, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Skeleton } from './skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { GateBadge } from '../generations/GateBadge';
import { CloneSpokeModal } from '../generations/CloneSpokeModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Spoke {
    id: string;
    hub_id: string;
    pillar_id: string;
    client_id: string;
    platform: string;
    content: string;
    psychological_angle: string;
    status: string;
    generation_attempt: number;
    parent_spoke_id?: string;
    is_variation?: number;
    created_at: number;
}

interface Pillar {
    id: string;
    name: string;
    spokes: Spoke[];
}

interface Hub {
    id: string;
    name: string;
    pillars: Pillar[];
}

import { motion, AnimatePresence } from 'framer-motion';

export function SpokeTreeView({ hubId }: { hubId: string }) {
    const { data: hubData } = useQuery({
        ...trpc.generations.getHub.queryOptions({ hubId }),
        enabled: !!hubId,
    });

    const { data: pillarsData } = useQuery({
        ...trpc.generations.getHubPillars.queryOptions({ hubId }),
        enabled: !!hubId,
    });

    const { data: spokes, isLoading, error } = useQuery({
        queryKey: ['spokes', hubId],
        queryFn: () => (trpc as any).generations.getSpokes.query({ hubId }),
        refetchInterval: 5000, 
    });

    const [platformFilter, setPlatformFilter] = useState('all');

    if (isLoading) return <TreeViewSkeleton />;
    if (error) return <div className="text-destructive p-4 border border-destructive/50 rounded-lg bg-destructive/10 font-mono text-sm">Error loading spokes: {error.message}</div>;

    const filteredSpokes = platformFilter === 'all'
        ? (spokes || [])
        : (spokes || []).filter((spoke: Spoke) => spoke.platform === platformFilter);

    // Filter out variations for the top-level pillar list, we'll nest them inside their parents
    const seedSpokes = filteredSpokes.filter((s: Spoke) => !(s as any).is_variation);

    const hub: Hub = {
        id: hubId,
        name: hubData?.name || 'Loading...', 
        pillars: seedSpokes.reduce((acc: Pillar[], spoke: Spoke) => {
            let pillar = acc.find(p => p.id === spoke.pillar_id);
            if (!pillar) {
                const pillarInfo = pillarsData?.find((p: any) => p.id === spoke.pillar_id);
                pillar = { id: spoke.pillar_id, name: pillarInfo?.name || `Pillar ${spoke.pillar_id}`, spokes: [] };
                acc.push(pillar);
            }
            pillar.spokes.push(spoke);
            return acc;
        }, [])
    };

    const platforms = ['all', ...new Set((spokes || []).map((spoke: Spoke) => spoke.platform))] as string[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card/40 p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                        <Layers className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium tracking-tight">Seed Spokes: <span className="text-foreground font-bold">{seedSpokes.length}</span></span>
                </div>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="w-[180px] bg-background border-border h-9 rounded-lg">
                        <SelectValue placeholder="Filter by platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-xl shadow-2xl">
                        {platforms.map(platform => (
                            <SelectItem key={platform} value={platform} className="capitalize text-sm py-2">
                                {platform}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <HubNode hub={hub} allSpokes={filteredSpokes} />
        </div>
    );
}

function HubNode({ hub, allSpokes }: { hub: Hub, allSpokes: Spoke[] }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="p-1 rounded-2xl bg-card/20 border border-border/40 shadow-inner overflow-hidden">
            <div
                className="flex items-center p-5 cursor-pointer hover:bg-card/40 rounded-t-2xl transition-all duration-300"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown className="h-5 w-5 mr-3 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 mr-3 text-muted-foreground" />}
                <div className="p-2 bg-primary/10 rounded-xl mr-4 shadow-sm">
                    <Bot className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{hub.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded border border-border/50">{hub.id}</span>
                        <span className="text-border text-xs">•</span>
                        <span className="text-xs text-muted-foreground font-medium">{hub.pillars.length} active pillars</span>
                    </div>
                </div>
            </div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="p-5 pt-0 space-y-5 overflow-hidden"
                    >
                        {hub.pillars.map(pillar => (
                            <PillarNode key={pillar.id} pillar={pillar} allSpokes={allSpokes} />
                        ))}
                        {hub.pillars.length === 0 && (
                            <div className="py-16 text-center text-muted-foreground italic border-t border-border/30 font-serif leading-relaxed">
                                No spokes generated yet. Launch an agent to begin.
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


function PillarNode({ pillar, allSpokes }: { pillar: Pillar, allSpokes: Spoke[] }) {
    const [isOpen, setIsOpen] = useState(true);
    const queryClient = useQueryClient();
    const clientId = 'temp-client-id'; // TODO: Get from auth

    const killPillarMutation = useMutation({
        ...trpc.generations.killPillar.mutationOptions(),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['spokes'] });
            toast.error('Pillar killed', {
                description: 'All non-mutated spokes in this pillar discarded.',
                action: {
                    label: 'Undo',
                    onClick: () => undoKillPillarMutation.mutate(variables)
                },
                duration: 30000,
            });
        }
    });

    const undoKillPillarMutation = useMutation({
        ...trpc.generations.undoKillPillar.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spokes'] });
            toast.success('Pillar restored');
        }
    });

    return (
        <div className="rounded-xl border border-border bg-card/30 overflow-hidden shadow-sm transition-all duration-300">
            <div
                className="flex items-center cursor-pointer bg-secondary/20 p-4 hover:bg-secondary/40 transition-colors border-b border-border/50 group"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown className="h-4 w-4 mr-3 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 mr-3 text-muted-foreground" />}
                <Layout className="h-4 w-4 mr-3 text-primary/60" />
                <h3 className="text-md font-bold text-foreground tracking-tight">{pillar.name}</h3>
                
                <div className="flex items-center gap-3 ml-auto">
                    <Badge variant="outline" className="bg-background/50 text-[10px] py-0 h-6 border-border font-mono px-2">
                        {pillar.spokes.length} Seed Spokes
                    </Badge>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            killPillarMutation.mutate({ pillarId: pillar.id, clientId });
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="p-4 grid grid-cols-1 gap-4 overflow-hidden"
                    >
                        {pillar.spokes.map((spoke, index) => (
                            <motion.div
                                key={spoke.id}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <SpokeNode spoke={spoke} allSpokes={allSpokes} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SpokeNode({ spoke, allSpokes }: { spoke: Spoke, allSpokes: Spoke[] }) {
    const platformBadges: { [key: string]: { color: string, label: string, icon: React.ReactNode } } = {
        twitter: { color: '#1DA1F2', label: 'Twitter', icon: <Twitter className="h-3.5 w-3.5" /> },
        linkedin: { color: '#0A66C2', label: 'LinkedIn', icon: <Linkedin className="h-3.5 w-3.5" /> },
        tiktok: { color: '#000000', label: 'TikTok', icon: <Video className="h-3.5 w-3.5" /> },
        instagram: { color: '#E4405F', label: 'Instagram', icon: <Instagram className="h-3.5 w-3.5" /> },
        newsletter: { color: '#FFAD1F', label: 'Newsletter', icon: <Mail className="h-3.5 w-3.5" /> },
        thread: { color: '#1D9BF0', label: 'Thread', icon: <Twitter className="h-3.5 w-3.5" /> },
        carousel: { color: '#00D26A', label: 'Carousel', icon: <Layers className="h-3.5 w-3.5" /> },
    };

    const badge = platformBadges[spoke.platform] || { color: '#8B98A5', label: spoke.platform, icon: <Bot className="h-3.5 w-3.5" /> };

    const { data: evaluation } = useQuery({
        ...trpc.generations.getSpokeEvaluation.queryOptions({ spokeId: spoke.id }),
    });

    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
    const [isVariationsOpen, setIsVariationsOpen] = useState(false);

    // Find variations of this spoke
    const variations = allSpokes.filter(s => s.parent_spoke_id === spoke.id);

    const getStatusBadge = () => {
        if (spoke.status === 'ready_for_review' && evaluation && !evaluation.overall_pass) {
            return <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-[10px] py-0 h-5 font-bold uppercase tracking-widest px-2">Manually Approved</Badge>;
        }
        if (spoke.status === 'pending_manual_rewrite') {
            return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 text-[10px] py-0 h-5 font-bold uppercase tracking-widest px-2">Manual Rewrite Needed</Badge>;
        }
        if (spoke.status === 'discarded') {
            return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] py-0 h-5 font-bold uppercase tracking-widest px-2">Discarded</Badge>;
        }
        if (spoke.status === 'failed_qa') {
            return <Badge variant="destructive" className="text-[10px] py-0 h-5 font-bold uppercase tracking-widest px-2">QA Failed</Badge>;
        }
        if (spoke.status === 'generating') {
            return <Badge variant="outline" className="animate-pulse text-[10px] py-0 h-5 border-primary/30 text-primary/70 font-bold uppercase tracking-widest px-2">Generating...</Badge>;
        }
        return null;
    };

    const isHighConfidence = evaluation && evaluation.g7_score > 9.0;

    return (
        <div className={`space-y-2`}>
            <div className={`bg-card/40 p-5 rounded-xl border transition-all duration-300 shadow-sm ${spoke.status === 'discarded' ? 'border-destructive/10 opacity-50 grayscale' : 'border-border/60 hover:border-border hover:shadow-md'} ${spoke.is_variation ? 'ml-8 border-dashed' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div 
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider"
                        style={{ backgroundColor: `${badge.color}22`, color: badge.color, border: `1px solid ${badge.color}44` }}
                        >
                            {badge.icon}
                            <span>{badge.label}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] py-0 h-5 border-border text-muted-foreground capitalize font-medium tracking-tight">
                            {spoke.psychological_angle}
                        </Badge>
                        {getStatusBadge()}
                        {spoke.is_variation ? <Badge variant="secondary" className="bg-info/10 text-info border-info/20 text-[10px] py-0 h-5 font-bold uppercase tracking-widest px-2">Variation</Badge> : null}
                    </div>
                    <div className="flex gap-2 items-center">
                    {isHighConfidence && !spoke.is_variation && (
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 px-3 text-[10px] bg-success/10 text-success hover:bg-success/20 border-success/20 gap-1.5 font-bold uppercase tracking-widest transition-all duration-200"
                            onClick={() => setIsCloneModalOpen(true)}
                        >
                            <Zap className="h-3.5 w-3.5 fill-current" />
                            Clone Best
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-200" onClick={() => navigator.clipboard.writeText(spoke.content)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    </div>
                </div>
                
                <div className="bg-background/40 p-4 rounded-xl border border-border/30 mb-5 shadow-inner backdrop-blur-sm">
                    <p className="text-[15px] text-foreground leading-relaxed whitespace-pre-wrap font-sans tracking-tight">{spoke.content}</p>
                </div>

                <div className="flex items-center justify-between">
                    {evaluation ? (
                        <div className="flex flex-wrap gap-2.5">
                            <GateBadge
                                gate="G2"
                                score={evaluation.g2_score}
                                breakdown={typeof evaluation.g2_breakdown === 'string' ? JSON.parse(evaluation.g2_breakdown || '{}') : evaluation.g2_breakdown}
                                notes="Analysis complete"
                            />
                            <GateBadge
                                gate="G4"
                                result={evaluation.g4_result as 'pass' | 'fail'}
                                violations={typeof evaluation.g4_violations === 'string' ? JSON.parse(evaluation.g4_violations || '[]') : evaluation.g4_violations}
                                cosineSimilarity={evaluation.g4_similarity_score}
                            />
                            <GateBadge
                                gate="G5"
                                result={evaluation.g5_result as 'pass' | 'fail'}
                                violations={typeof evaluation.g5_violations === 'string' ? JSON.parse(evaluation.g5_violations || '[]') : evaluation.g5_violations}
                            />
                            {evaluation.g7_score && (
                                <Badge variant="outline" className={`text-[10px] py-0 h-6 font-bold uppercase tracking-widest px-2.5 ${evaluation.g7_score > 8 ? 'text-success border-success/30 bg-success/5' : 'text-warning border-warning/30 bg-warning/5'}`}>
                                    G7: {evaluation.g7_score}
                                </Badge>
                            )}
                        </div>
                    ) : spoke.status !== 'ready' && spoke.status !== 'generating' && (
                        <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full bg-secondary/30" />
                        <Skeleton className="h-6 w-16 rounded-full bg-secondary/30" />
                        <Skeleton className="h-6 w-16 rounded-full bg-secondary/30" />
                        </div>
                    )}

                    {variations.length > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[11px] text-muted-foreground hover:text-foreground hover:bg-background gap-1.5 transition-all duration-200 font-medium px-3 rounded-lg"
                            onClick={() => setIsVariationsOpen(!isVariationsOpen)}
                        >
                            {isVariationsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            {variations.length} Variations
                        </Button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isVariationsOpen && variations.length > 0 && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="space-y-4 pt-2 overflow-hidden"
                    >
                        {variations.map((variation, index) => (
                            <motion.div
                                key={variation.id}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <SpokeNode spoke={variation} allSpokes={allSpokes} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <CloneSpokeModal 
                spoke={spoke} 
                isOpen={isCloneModalOpen} 
                onOpenChange={setIsCloneModalOpen} 
            />
        </div>
    );
}


function TreeViewSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="pl-8 space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="pl-6 space-y-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        </div>
    );
}