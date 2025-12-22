import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { SprintItem } from './types';
import { GateBadge } from '@/components/generations/GateBadge'; // Re-using existing GateBadge

interface ContentCardProps {
  item: SprintItem;
  exitDirection: 'left' | 'right' | 'up' | null;
  isAnimating: boolean;
}

const cardVariants = {
  enter: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const, // easeOut
    },
  },
  exitRight: {
    opacity: 0,
    x: '100%',
    scale: 1.02,
    rotate: 5,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1] as const, // easeIn
    },
  },
  exitLeft: {
    opacity: 0,
    x: '-100%',
    scale: 0.98,
    rotate: -5,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1] as const, // easeIn
    },
  },
  exitUp: {
    opacity: 0,
    y: '-100%',
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1] as const, // easeIn
    },
  },
};

// Flash overlay variants
const flashVariants = {
  hidden: { opacity: 0 },
  approveFlash: {
    opacity: [0, 0.3, 0],
    transition: { duration: 0.2 },
  },
  killFlash: {
    opacity: [0, 0.3, 0],
    transition: { duration: 0.2 },
  },
  skipFlash: {
    opacity: [0, 0.3, 0],
    transition: { duration: 0.2 },
  },
};

export function ContentCard({ item, exitDirection, isAnimating }: ContentCardProps) {
  const getExitVariant = () => {
    if (!isAnimating) return 'center';
    if (exitDirection === 'right') return 'exitRight';
    if (exitDirection === 'left') return 'exitLeft';
    if (exitDirection === 'up') return 'exitUp';
    return 'center';
  };

  const getFlashVariant = () => {
    if (!isAnimating) return 'hidden';
    if (exitDirection === 'right') return 'approveFlash';
    if (exitDirection === 'left') return 'killFlash';
    if (exitDirection === 'up') return 'skipFlash';
    return 'hidden';
  };

  return (
    <motion.div
      key={item.id}
      initial="enter"
      animate={getExitVariant()}
      variants={cardVariants}
      className="w-full max-w-[880px] relative"
    >
      {/* Color flash overlay */}
      <motion.div
        className={`absolute inset-0 rounded-lg pointer-events-none z-10
          ${exitDirection === 'right' ? 'bg-success' : ''}
          ${exitDirection === 'left' ? 'bg-destructive' : ''}
          ${exitDirection === 'up' ? 'bg-warning' : ''}
        `}
        initial="hidden"
        animate={getFlashVariant()}
        variants={flashVariants}
      />

      <Card className="bg-card/40 border-border overflow-hidden shadow-2xl backdrop-blur-md">
        <CardContent className="p-10">
          {/* Content Preview with Platform Formatting */}
          <div className="text-[17px] text-foreground leading-relaxed whitespace-pre-wrap min-h-[240px] mb-8 font-sans tracking-tight">
            {item.platform === 'thread' ? (
              <ThreadRenderer content={item.content} />
            ) : item.platform === 'carousel' ? (
              <CarouselRenderer content={item.content} />
            ) : (
              item.content
            )}
          </div>

          {/* Gate Status */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
            <GateBadge gate="G4 Voice Alignment" result={item.gates.g4Passed ? 'pass' : 'fail'} />
            <GateBadge gate="G5 Platform Compliance" result={item.gates.g5Passed ? 'pass' : 'fail'} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ThreadRenderer({ content }: { content: string }) {
  try {
    const posts = JSON.parse(content);
    if (Array.isArray(posts)) {
      return (
        <div className="space-y-6">
          {posts.map((post, i) => (
            <div key={i} className="p-6 bg-background/50 border border-border rounded-xl shadow-inner">
              <div className="text-[10px] font-mono text-muted-foreground mb-3 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-[1px] bg-border" />
                <span>Post {i + 1} of {posts.length}</span>
              </div>
              <div className="text-foreground leading-relaxed">{post}</div>
            </div>
          ))}
        </div>
      );
    }
  } catch (e) {}
  return <div className="text-destructive italic font-mono text-sm bg-destructive/10 p-4 rounded-lg border border-destructive/20">Invalid Thread Format: {content}</div>;
}

function CarouselRenderer({ content }: { content: string }) {
  try {
    const slides = JSON.parse(content);
    if (Array.isArray(slides)) {
      return (
        <div className="space-y-6">
          {slides.map((slide, i) => (
            <div key={i} className="p-6 bg-background/50 border border-border rounded-xl shadow-inner">
              <div className="text-[10px] font-mono text-muted-foreground mb-3 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-[1px] bg-border" />
                <span>Slide {i + 1}</span>
              </div>
              <div className="font-bold text-foreground mb-2 text-lg tracking-tight">{slide.title}</div>
              <div className="text-muted-foreground leading-relaxed">{slide.description}</div>
            </div>
          ))}
        </div>
      );
    }
  } catch (e) {}
  return <div className="text-destructive italic font-mono text-sm bg-destructive/10 p-4 rounded-lg border border-destructive/20">Invalid Carousel Format: {content}</div>;
}

// Wrapper for AnimatePresence
export function ContentCardContainer({
  item,
  exitDirection,
  isAnimating,
}: ContentCardProps) {
  return (
    <ContentCard
      item={item}
      exitDirection={exitDirection}
      isAnimating={isAnimating}
    />
  );
}
