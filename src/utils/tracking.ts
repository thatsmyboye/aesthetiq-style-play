/**
 * Simple tracking for choice milestones
 */

interface TrackingEvent {
  type: 'milestone' | 'feature';
  data: Record<string, any>;
  timestamp: number;
}

const STORAGE_KEY = 'aesthetiq-events';
const MILESTONES = [1, 5, 10, 20, 30, 40, 50, 60, 100];

/**
 * Log an event to localStorage
 */
function logEvent(type: TrackingEvent['type'], data: Record<string, any>) {
  try {
    const events = getEvents();
    events.push({
      type,
      data,
      timestamp: Date.now(),
    });
    
    // Keep last 100 events
    const trimmed = events.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

/**
 * Get all tracked events
 */
export function getEvents(): TrackingEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Track choice milestone
 */
export function trackChoiceMilestone(choiceCount: number) {
  if (MILESTONES.includes(choiceCount)) {
    logEvent('milestone', {
      milestone: 'choices',
      count: choiceCount,
    });
  }
}

/**
 * Track feature usage
 */
export function trackFeature(featureName: string, details?: Record<string, any>) {
  logEvent('feature', {
    feature: featureName,
    ...details,
  });
}

/**
 * Clear all events
 */
export function clearEvents() {
  localStorage.removeItem(STORAGE_KEY);
}
