// API Endpoints
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',

  // Customers
  CUSTOMERS: '/api/customers',
  CUSTOMER_BY_ID: (id: string) => `/api/customers/${id}`,
  CUSTOMER_SEARCH: '/api/customers/search',
  CUSTOMER_JOBS: (id: string) => `/api/customers/${id}/jobs`,

  // Jobs
  JOBS: '/api/jobs',
  JOB_BY_ID: (id: string) => `/api/jobs/${id}`,
  JOB_MATERIALS: (id: string) => `/api/jobs/${id}/materials`,
  JOB_ASSIGN: (id: string) => `/api/jobs/${id}/assign`,
  JOB_STATUS: (id: string) => `/api/jobs/${id}/status`,

  // Materials
  MATERIALS: '/api/materials',
  MATERIAL_BY_ID: (id: string) => `/api/materials/${id}`,
  MATERIALS_BULK_UPDATE: '/api/materials/bulk-update',

  // Sync
  SYNC_STATUS: '/api/sync/status',
  SYNC_PUSH: '/api/sync/push',
  SYNC_PULL: '/api/sync/pull',

  // Workers
  WORKER_TASKS: '/api/workers/tasks',
  WORKERS_LIST: '/api/workers',

  // Dashboard
  DASHBOARD_STATS: '/api/dashboard/stats',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'khs_auth_token',
  REFRESH_TOKEN: 'khs_refresh_token',
  USER_DATA: 'khs_user_data',
  SYNC_QUEUE: 'khs_sync_queue',
  OFFLINE_DATA: 'khs_offline_data',
  LAST_SYNC: 'khs_last_sync',
  THEME: 'khs_theme',
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  PHONE_PATTERN: /^\+?[\d\s\-\(\)]+$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_NOTES_LENGTH: 1000,
  MAX_TITLE_LENGTH: 100,
} as const;

// Material Units
export const MATERIAL_UNITS = [
  'each',
  'box',
  'case',
  'feet',
  'yards',
  'meters',
  'inches',
  'gallons',
  'liters',
  'pounds',
  'kilograms',
  'hours',
  'days',
  'rolls',
  'sheets',
  'bags',
  'tons',
] as const;

// Job Status Display
export const JOB_STATUS_DISPLAY = {
  NOT_STARTED: { label: 'Not Started', color: 'gray', icon: 'clock' },
  IN_PROGRESS: { label: 'In Progress', color: 'blue', icon: 'wrench' },
  WAITING_ON_MATERIALS: { label: 'Waiting on Materials', color: 'yellow', icon: 'package' },
  COMPLETED: { label: 'Completed', color: 'green', icon: 'check' },
  ON_HOLD: { label: 'On Hold', color: 'orange', icon: 'pause' },
} as const;

// Error Codes
export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SYNC_ERROR: 'SYNC_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// User-friendly error messages
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please log in again',
  [ERROR_CODES.UNAUTHORIZED]: 'You must be logged in to access this resource',
  [ERROR_CODES.FORBIDDEN]: 'You do not have permission to perform this action',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'This item already exists',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection',
  [ERROR_CODES.SYNC_ERROR]: 'Failed to sync data. Your changes are saved locally',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later',
  DEFAULT: 'An unexpected error occurred. Please try again',
};

// PWA Config
export const PWA_CONFIG = {
  APP_NAME: 'KHS CRM',
  APP_SHORT_NAME: 'KHS',
  APP_DESCRIPTION: 'KHS Construction & Remodeling CRM',
  THEME_COLOR: '#1e40af',
  BACKGROUND_COLOR: '#ffffff',
  START_URL: '/',
  DISPLAY: 'standalone',
  ORIENTATION: 'portrait',
} as const;

// Cache Config
export const CACHE_CONFIG = {
  CACHE_NAME: 'khs-crm-v1',
  STATIC_CACHE_NAME: 'khs-static-v1',
  DYNAMIC_CACHE_NAME: 'khs-dynamic-v1',
  MAX_CACHE_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_DYNAMIC_ITEMS: 50,
} as const;

// Sync Config
export const SYNC_CONFIG = {
  AUTO_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  BATCH_SIZE: 50,
  CONFLICT_RESOLUTION: 'SERVER_WINS' as const,
} as const;

// UI Config
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_MS: 300,
  TOAST_DURATION_MS: 4000,
  MIN_TOUCH_TARGET_SIZE: 48, // pixels
  MAX_MOBILE_WIDTH: 768,
  TRANSITIONS_ENABLED: true,
} as const;