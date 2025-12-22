/**
 * ContextBar Component
 *
 * Shows breadcrumb navigation and platform badge.
 * Provides context: Client > Platform > Hub > Pillar
 */

import { Badge } from '@/components/ui/badge';
import { ChevronRight, Linkedin, Twitter, Instagram, Video, Mail, Layout, Layers } from 'lucide-react';
import type { Platform } from './types';
import { PLATFORM_CONFIG } from './types';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

interface ContextBarProps {
  hubId: string;
  pillarId: string;
  platform: Platform;
}

export function ContextBar({ hubId, pillarId, platform }: ContextBarProps) {
  const platformConfig = PLATFORM_CONFIG[platform];
  const PlatformIcon = getPlatformIcon(platform);

  // TODO: Get client name from auth context
  const clientName = "My Client"; 

  const { data: hubData } = useQuery({
    ...trpc.generations.getHub.queryOptions({ hubId }),
    enabled: !!hubId && hubId !== 'global',
  });

  const { data: pillarData } = useQuery({
    ...trpc.generations.getHubPillars.queryOptions({ hubId }),
    enabled: !!hubId && hubId !== 'global',
  });

  const currentPillar = pillarData?.find((p: any) => p.id === pillarId);

  return (
    <div className="w-full max-w-[880px] flex items-center justify-between py-3">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <BreadcrumbItem label={clientName} />
        <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
        <BreadcrumbItem label={platformConfig.label} />
        <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
        <BreadcrumbItem label={hubData?.name || 'All Campaigns'} />
        <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
        <BreadcrumbItem label={currentPillar?.name || 'All Pillars'} isLast />
      </nav>

      {/* Platform Badge */}
      <Badge
        variant="outline"
        className="px-3 py-1 gap-2 border-border text-foreground bg-card/50"
        style={{
          borderColor: `${platformConfig.color}40`,
          color: platformConfig.color,
          backgroundColor: `${platformConfig.color}10`,
        }}
      >
        <PlatformIcon className="h-3.5 w-3.5" />
        {platformConfig.label}
      </Badge>
    </div>
  );
}

interface BreadcrumbItemProps {
  label: string;
  isLast?: boolean;
}

function BreadcrumbItem({ label, isLast = false }: BreadcrumbItemProps) {
  return (
    <span
      className={`
        ${isLast ? 'text-foreground font-semibold' : 'text-muted-foreground'}
        hover:text-foreground transition-colors cursor-default tracking-tight
      `}
    >
      {label}
    </span>
  );
}

function getPlatformIcon(platform: Platform) {
  switch (platform) {
    case 'linkedin':
      return Linkedin;
    case 'twitter':
      return Twitter;
    case 'instagram':
      return Instagram;
    case 'tiktok':
      return Video;
    case 'newsletter':
      return Mail;
    case 'thread':
      return Layout;
    case 'carousel':
      return Layers;
    default:
      return ({ className }: { className?: string }) => (
        <div className={`rounded-full bg-current opacity-50 ${className}`} style={{ width: '14px', height: '14px' }} />
      );
  }
}
