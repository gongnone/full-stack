/**
 * useSprintQueue Hook
 *
 * Manages queue state for Sprint View.
 * Handles navigation, decisions, and animation state.
 */

import { useState, useCallback, useMemo } from 'react';
import type { SprintItem, SprintState, SprintAction, SprintDecision, SprintStats } from '../types';

const ANIMATION_DURATION = 300; // ms

export interface UseSprintQueueReturn {
  state: SprintState;
  currentItem: SprintItem | null;
  progress: number;
  remaining: number;
  stats: SprintStats;
  isComplete: boolean;

  // Actions
  approve: () => void;
  kill: () => void;
  killHubItems: (hubId: string) => void;
  skip: () => void;
  toggleNotes: () => void;
  reset: () => void;
}

export function useSprintQueue(items: SprintItem[]): UseSprintQueueReturn {
  const [state, setState] = useState<SprintState>({
    items,
    currentIndex: 0,
    decisions: [],
    showCriticNotes: false,
    isAnimating: false,
    exitDirection: null,
  });

  const currentItem = useMemo(() => {
    return state.items[state.currentIndex] ?? null;
  }, [state.items, state.currentIndex]);

  const progress = useMemo(() => {
    if (state.items.length === 0) return 0;
    return (state.currentIndex / state.items.length) * 100;
  }, [state.currentIndex, state.items.length]);

  const remaining = useMemo(() => {
    return Math.max(0, state.items.length - state.currentIndex);
  }, [state.items.length, state.currentIndex]);

  const isComplete = useMemo(() => {
    return state.currentIndex >= state.items.length;
  }, [state.currentIndex, state.items.length]);

  const stats = useMemo((): SprintStats => {
    const decisions = state.decisions;
    
    let totalDecisionTime = 0;
    if (decisions.length > 0) {
      // Calculate time between decisions
      // For the first decision, we use time from start (approximate with first decision timestamp - state creation time if we had it)
      // For simplicity, we'll just average the gaps between N and N-1
      for (let i = 1; i < decisions.length; i++) {
        totalDecisionTime += (decisions[i].timestamp - decisions[i-1].timestamp);
      }
    }

    return {
      total: state.items.length,
      approved: decisions.filter(d => d.action === 'approve').length,
      killed: decisions.filter(d => d.action === 'kill').length,
      edited: decisions.filter(d => d.action === 'edit').length,
      skipped: decisions.filter(d => d.action === 'skip').length,
      averageDecisionTime: decisions.length > 1 ? Math.floor(totalDecisionTime / (decisions.length - 1)) : 0,
    };
  }, [state.decisions, state.items.length]);

  const advance = useCallback((action: SprintAction, direction: 'left' | 'right' | 'up' | null) => {
    if (!currentItem || state.isAnimating) return;

    const decision: SprintDecision = {
      itemId: currentItem.id,
      action,
      timestamp: Date.now(),
    };

    // Start animation
    setState(prev => ({
      ...prev,
      isAnimating: true,
      exitDirection: direction,
      decisions: [...prev.decisions, decision],
    }));

    // After animation, advance
    setTimeout(() => {
      setState(prev => {
        const nextState = { ...prev, isAnimating: false, exitDirection: null, showCriticNotes: false };
        
        if (action === 'skip') {
          // Move current item to end of queue and keep currentIndex same
          const newItems = [...prev.items];
          const [skippedItem] = newItems.splice(prev.currentIndex, 1);
          newItems.push(skippedItem);
          return { ...nextState, items: newItems };
        } else {
          // Just move to next index
          return { ...nextState, currentIndex: prev.currentIndex + 1 };
        }
      });
    }, ANIMATION_DURATION);
  }, [currentItem, state.isAnimating]);

  const approve = useCallback(() => {
    advance('approve', 'right');
  }, [advance]);

  const kill = useCallback(() => {
    advance('kill', 'left');
  }, [advance]);

  const killHubItems = useCallback((hubId: string) => {
    if (state.isAnimating) return;

    setState(prev => {
      const currentItem = prev.items[prev.currentIndex];
      const isCurrentItemKilled = currentItem?.hubId === hubId;
      
      const affectedItems = prev.items.filter(item => item.hubId === hubId);
      const remainingItems = prev.items.filter(item => item.hubId !== hubId);
      
      const newDecisions = affectedItems.map(item => ({
        itemId: item.id,
        action: 'kill' as SprintAction,
        timestamp: Date.now(),
      }));

      // Find the next item to show if the current one was killed
      // We look for the first item in remainingItems that was AFTER the current index in the original list
      let nextIndex = prev.currentIndex;
      
      if (isCurrentItemKilled) {
        // Find the first item in original items after current index that is NOT in the killed hub
        const nextAvailableItemInOriginal = prev.items.slice(prev.currentIndex + 1).find(item => item.hubId !== hubId);
        
        if (nextAvailableItemInOriginal) {
          nextIndex = remainingItems.findIndex(item => item.id === nextAvailableItemInOriginal.id);
        } else {
          // No more items after this in the original list that survived the kill
          nextIndex = remainingItems.length; // Triggers completion
        }
      } else {
        // Current item survived, just find its new index in the filtered list
        nextIndex = remainingItems.findIndex(item => item.id === currentItem.id);
      }

      return {
        ...prev,
        items: remainingItems,
        currentIndex: nextIndex,
        decisions: [...prev.decisions, ...newDecisions],
      };
    });
  }, [state.isAnimating]);

  const skip = useCallback(() => {
    advance('skip', 'up');
  }, [advance]);

  const toggleNotes = useCallback(() => {
    setState(prev => ({
      ...prev,
      showCriticNotes: !prev.showCriticNotes,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      items,
      currentIndex: 0,
      decisions: [],
      showCriticNotes: false,
      isAnimating: false,
      exitDirection: null,
    });
  }, [items]);

  return {
    state,
    currentItem,
    progress,
    remaining,
    stats,
    isComplete,
    approve,
    kill,
    killHubItems,
    skip,
    toggleNotes,
    reset,
  };
}
