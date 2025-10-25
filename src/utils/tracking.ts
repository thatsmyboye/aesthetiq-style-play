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
  // Check analytics consent before tracking (GDPR requirement)
  let analyticsConsent = false;
  try {
    const consentRaw = localStorage.getItem("aesthetiq.cmp.v1");
    if (consentRaw) {
      const consent = JSON.parse(consentRaw);
      analyticsConsent = consent?.analytics === true;
    }
  } catch {}

  if (!analyticsConsent) return; // Don't track without consent

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
  // Check analytics consent before tracking (GDPR requirement)
  let analyticsConsent = false;
  try {
    const consentRaw = localStorage.getItem("aesthetiq.cmp.v1");
    if (consentRaw) {
      const consent = JSON.parse(consentRaw);
      analyticsConsent = consent?.analytics === true;
    }
  } catch {}

  if (!analyticsConsent) return; // Don't track without consent

  logEvent('feature', {
    feature: featureName,
    ...details,
  });
  
  // Also push to dataLayer for GTM if available
  try {
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: featureName,
        ...details,
      });
    }
  } catch {}
}

/**
 * Clear all events
 */
export function clearEvents() {
  localStorage.removeItem(STORAGE_KEY);
}
