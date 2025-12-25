/**
 * Story 3.1: Source Selection & Upload Wizard
 * Shared constants for file uploads and content validation
 */

// File upload limits
export const UPLOAD_LIMITS = {
  /** Maximum PDF file size in bytes (50MB) */
  MAX_PDF_SIZE_BYTES: 50 * 1024 * 1024,
  /** Maximum PDF file size in MB for display */
  MAX_PDF_SIZE_MB: 50,
} as const;

// Text content limits
export const TEXT_CONTENT_LIMITS = {
  /** Minimum characters required for text sources */
  MIN_CHARS: 100,
  /** Maximum characters allowed for text sources */
  MAX_CHARS: 100000,
  /** Maximum title length */
  MAX_TITLE_LENGTH: 255,
} as const;

// URL validation
export const URL_VALIDATION = {
  /** Maximum URL length */
  MAX_URL_LENGTH: 2048,
} as const;

// Auth configuration
export const AUTH_CONFIG = {
  /** Minimum password length requirement */
  MIN_PASSWORD_LENGTH: 12,
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  APP: {
    DASHBOARD: '/app',
    HUBS: '/app/hubs',
    HUBS_NEW: '/app/hubs/new',
    REVIEW: '/app/review',
    CLIENTS: '/app/clients',
    BRAND_DNA: '/app/brand-dna',
    ANALYTICS: '/app/analytics',
    SETTINGS: '/app/settings',
  },
} as const;

// Validation & UI Limits
export const VALIDATION_LIMITS = {
  /** Maximum length for a voice marker phrase */
  MAX_VOICE_MARKER_LENGTH: 200,
  /** Maximum length for a banned word */
  MAX_BANNED_WORD_LENGTH: 100,
} as const;

// UI & Performance configuration
export const UI_CONFIG = {
  /** Page load performance budget in ms */
  PERFORMANCE_BUDGET_MS: 3000,
  /** Standard toast durations in ms */
  TOAST_DURATION: {
    SUCCESS: 2000,
    ERROR: 4000,
    INFO: 3000,
  },
  /** Duration to show "Copied!" state in ms */
  COPIED_STATE_DURATION_MS: 2000,
  /** User profile character limits */
  USER_PROFILE: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
  },
  /** Chart color palette */
  CHART_COLORS: {
    PRIMARY: '#00ff88',
    G2: '#ff6b6b',
    G4: '#4ecdc4',
    G5: '#95e1d3',
    G7: '#ffd93d',
    DRIFT: '#fbbf24',
    THRESHOLD: '#ef4444',
  },
} as const;

// Analytics configuration
export const ANALYTICS_CONFIG = {
  /** Default number of days for analytics queries */
  DEFAULT_PERIOD_DAYS: 30,
  /** Trend window size in days */
  TREND_WINDOW_DAYS: 7,
} as const;

// Export configuration
export const EXPORT_CONFIG = {
  /** Default limit for export history list */
  HISTORY_LIMIT: 20,
} as const;

// Client & Team configuration
export const CLIENT_CONFIG = {
  /** Default brand color for new clients */
  DEFAULT_BRAND_COLOR: '#1D9BF0',
  /** Status color mappings */
  STATUS_COLORS: {
    active: 'var(--approve)',
    paused: 'var(--warning)',
    archived: 'var(--text-muted)',
  },
} as const;

// Brand DNA configuration
export const BRAND_DNA_CONFIG = {
  /** Minimum number of training samples required for analysis */
  MIN_SAMPLES_FOR_ANALYSIS: 3,
  /** Maximum voice recording duration in seconds */
  MAX_VOICE_DURATION_SECONDS: 60,
  /** Status color thresholds for DNA strength */
  STRENGTH_THRESHOLDS: {
    STRONG: 80,
    ADEQUATE: 50,
  },
  /** Default limit for training samples list */
  SAMPLES_LIST_LIMIT: 50,
} as const;

// Quality Gate configuration
export const QUALITY_GATE_CONFIG = {
  /** G2 (Hook Strength) thresholds */
  G2: {
    PASS: 80,
    WARNING: 60,
  },
  /** Target Zero-Edit Rate percentage */
  TARGET_ZERO_EDIT_RATE: 60,
} as const;

// ROI & Business configuration
export const ROI_CONFIG = {
  /** Average minutes saved per spoke generated */
  MINUTES_SAVED_PER_SPOKE: 6,
  /** Average hourly rate for content creation in USD */
  HOURLY_RATE_USD: 200,
} as const;

// Wizard configuration
export const WIZARD_CONFIG = {
  /** Minimum number of pillars required to create a hub */
  MIN_PILLARS: 3,
  /** Animation delay for UI transitions in ms */
  ANIMATION_DELAY_MS: 300,
  /** Default error toast display time in ms */
  ERROR_TOAST_DURATION_MS: 5000,
  /** Delay before auto-advancing steps for UX in ms */
  AUTO_ADVANCE_MS: 500,
  /** Default debounce delay for inputs in ms */
  DEBOUNCE_MS: 300,
  /** Default undo window duration in seconds */
  UNDO_DURATION_SECONDS: 3,
} as const;

// Polling intervals
export const POLLING_CONFIG = {
  /** Default background polling interval in ms */
  DEFAULT_INTERVAL_MS: 2000,
} as const;

// Display helpers
export const formatFileSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  return `${bytes}B`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};
