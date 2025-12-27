/**
 * Story 2.5: Voice Marker and Banned Word Management
 * Task 6: Reusable EditableChipList component
 *
 * Displays items as chips with X buttons for removal.
 * Includes input field for adding new items.
 */

import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from 'react';

interface EditableChipListProps {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder?: string;
  chipColor?: 'blue' | 'red' | 'green';
  isLoading?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

const chipStyles = {
  blue: {
    bg: 'rgba(29, 155, 240, 0.15)',
    color: 'var(--edit)',
    border: '1px solid var(--edit)',
  },
  red: {
    bg: 'rgba(244, 33, 46, 0.15)',
    color: 'var(--kill)',
    border: '1px solid var(--kill)',
  },
  green: {
    bg: 'rgba(0, 210, 106, 0.15)',
    color: 'var(--approve)',
    border: '1px solid var(--approve)',
  },
};

export function EditableChipList({
  items,
  onAdd,
  onRemove,
  placeholder = 'Type and press Enter to add...',
  chipColor = 'blue',
  isLoading = false,
  disabled = false,
  maxLength = 100,
}: EditableChipListProps) {
  const [inputValue, setInputValue] = useState('');
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [newItems, setNewItems] = useState<Set<string>>(new Set());
  const previousItemsRef = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const style = chipStyles[chipColor];

  // Track newly added items for fade-in animation
  useEffect(() => {
    const prevItems = new Set(previousItemsRef.current);
    const addedItems = items.filter(item => !prevItems.has(item));

    if (addedItems.length > 0) {
      setNewItems(new Set(addedItems));
      // Clear the "new" status after animation completes
      const timer = setTimeout(() => setNewItems(new Set()), 300);
      return () => clearTimeout(timer);
    }

    previousItemsRef.current = items;
  }, [items]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        onAdd(inputValue.trim());
        setInputValue('');
      }
    },
    [inputValue, onAdd]
  );

  const handleRemove = useCallback(
    async (item: string) => {
      setRemovingItem(item);
      try {
        await onRemove(item);
      } finally {
        // Small delay for animation
        setTimeout(() => setRemovingItem(null), 150);
      }
    },
    [onRemove]
  );

  return (
    <div className="space-y-3">
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="w-full px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
          }}
          data-testid="chip-input"
        />
        {inputValue && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {inputValue.length}/{maxLength}
          </span>
        )}
      </div>

      {/* Chips list */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {items.length === 0 && !isLoading && (
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No items yet. Add one above.
          </span>
        )}
        {items.map((item) => (
          <span
            key={item}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
              transition-all duration-150
              ${removingItem === item ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
              ${newItems.has(item) ? 'animate-fadeIn' : ''}
            `}
            style={{
              backgroundColor: style.bg,
              color: style.color,
              border: style.border,
              animation: newItems.has(item) ? 'fadeIn 0.2s ease-out' : undefined,
            }}
            data-testid={`chip-${item}`}
          >
            <span>{item}</span>
            <button
              onClick={() => handleRemove(item)}
              disabled={disabled || isLoading}
              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors disabled:opacity-50"
              aria-label={`Remove ${item}`}
              data-testid={`remove-${item}`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
        {isLoading && (
          <span
            className="px-3 py-1.5 rounded-full text-sm animate-pulse"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            Loading...
          </span>
        )}
      </div>
    </div>
  );
}
