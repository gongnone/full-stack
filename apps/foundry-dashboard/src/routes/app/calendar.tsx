import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { ActionButton } from '@/components/ui';

export const Route = createFileRoute('/app/calendar')({
  component: CalendarPage,
});

interface CalendarSpoke {
  id: string;
  content: string;
  platform: string;
  status: string;
  hubId: string;
  hubTitle?: string;
  pillarTitle?: string;
  g7Score?: number;
  approvedAt?: number;
  scheduledFor?: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  tiktok: '#000000',
  facebook: '#1877F2',
  youtube: '#FF0000',
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarPage() {
  const clientId = useClientId();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch approved spokes for the current month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const spokesQuery = trpc.calendar.getMonthSpokes.useQuery(
    {
      clientId: clientId!,
      startDate: startOfMonth.getTime(),
      endDate: endOfMonth.getTime(),
    },
    { enabled: !!clientId }
  );

  const hubsQuery = trpc.hubs.list.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  );

  // Create hub lookup map
  const hubMap = useMemo(() => {
    const map = new Map<string, string>();
    hubsQuery.data?.items?.forEach(hub => {
      map.set(hub.id, hub.title);
    });
    return map;
  }, [hubsQuery.data]);

  // Group spokes by date
  const spokesByDate = useMemo(() => {
    const map = new Map<string, CalendarSpoke[]>();
    const spokes = spokesQuery.data?.items || [];

    spokes.forEach((spoke: CalendarSpoke) => {
      // Use scheduledFor if available, otherwise approvedAt
      const timestamp = spoke.scheduledFor || spoke.approvedAt;
      if (!timestamp) return;

      const date = new Date(timestamp);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push({
        ...spoke,
        hubTitle: hubMap.get(spoke.hubId),
      });
    });

    return map;
  }, [spokesQuery.data, hubMap]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Start from the Sunday of the week containing the 1st
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      });
    }

    return days;
  }, [currentDate]);

  const navigateMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const selectedSpokes = selectedDate
    ? spokesByDate.get(getDateKey(selectedDate)) || []
    : [];

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Content Calendar
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            View and manage your scheduled content
          </p>
        </div>
        <div className="flex gap-2">
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/app/exports' })}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </ActionButton>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {formatMonthYear(currentDate)}
              </h2>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Today
              </button>
            </div>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-[var(--border-subtle)]">
            {DAYS_OF_WEEK.map(day => (
              <div
                key={day}
                className="px-2 py-3 text-center text-xs font-medium text-[var(--text-muted)] uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dateKey = getDateKey(day.date);
              const daySpokes = spokesByDate.get(dateKey) || [];
              const isSelected = selectedDate?.toDateString() === day.date.toDateString();
              const isTodayDate = isToday(day.date);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    min-h-[100px] p-2 border-b border-r border-[var(--border-subtle)] text-left transition-colors
                    ${day.isCurrentMonth ? '' : 'opacity-40'}
                    ${isSelected ? 'bg-[var(--edit)] bg-opacity-10' : 'hover:bg-[var(--bg-surface)]'}
                  `}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isTodayDate ? 'w-7 h-7 rounded-full bg-[var(--edit)] text-white flex items-center justify-center' : 'text-[var(--text-primary)]'}
                  `}>
                    {day.date.getDate()}
                  </div>
                  {/* Content indicators */}
                  <div className="space-y-1">
                    {daySpokes.slice(0, 3).map(spoke => (
                      <div
                        key={spoke.id}
                        className="text-xs truncate rounded px-1 py-0.5"
                        style={{
                          backgroundColor: `${PLATFORM_COLORS[spoke.platform] || '#6B7280'}20`,
                          color: PLATFORM_COLORS[spoke.platform] || 'var(--text-secondary)',
                        }}
                        title={spoke.content}
                      >
                        {spoke.platform}
                      </div>
                    ))}
                    {daySpokes.length > 3 && (
                      <div className="text-xs text-[var(--text-muted)]">
                        +{daySpokes.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail Panel */}
        <div className="w-80 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <h3 className="font-semibold text-[var(--text-primary)]">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Select a date'}
            </h3>
            {selectedDate && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {selectedSpokes.length} content piece{selectedSpokes.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {!selectedDate ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">
                Click on a date to view scheduled content
              </p>
            ) : selectedSpokes.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">
                No content scheduled for this date
              </p>
            ) : (
              selectedSpokes.map(spoke => (
                <div
                  key={spoke.id}
                  className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${PLATFORM_COLORS[spoke.platform] || '#6B7280'}20`,
                        color: PLATFORM_COLORS[spoke.platform] || 'var(--text-secondary)',
                      }}
                    >
                      {spoke.platform}
                    </span>
                    {spoke.g7Score !== undefined && (
                      <span className={`text-xs font-bold ${spoke.g7Score >= 9 ? 'text-[var(--approve)]' : 'text-[var(--text-muted)]'}`}>
                        G7: {spoke.g7Score.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-primary)] line-clamp-3">
                    {spoke.content}
                  </p>
                  {spoke.hubTitle && (
                    <p className="text-xs text-[var(--text-muted)]">
                      Hub: {spoke.hubTitle}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Loading/Empty States */}
      {spokesQuery.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--edit)]" />
        </div>
      )}

      {/* Platform Legend */}
      <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
        <span className="font-medium">Platforms:</span>
        {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
          <div key={platform} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="capitalize">{platform}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
