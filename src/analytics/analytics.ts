export type AnalyticsEventName =
  | 'landing_view'
  | 'test_start'
  | 'question_answer'
  | 'test_complete'
  | 'result_view'
  | 'report_bottom_view'
  | 'share_card_generate'
  | 'share_card_save'
  | 'share_card_download'
  | 'share_card_share'
  | 'restart_test';
export interface AnalyticsEvent {
  name: AnalyticsEventName;
  at: string;
  sessionId?: string;
  properties?: Record<string, string | number | boolean>;
}
export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
}
class LocalAnalyticsProvider implements AnalyticsProvider {
  track(event: AnalyticsEvent) {
    try {
      const prior = JSON.parse(localStorage.getItem('archetype-lab:events') || '[]');
      const events = Array.isArray(prior) ? prior : [];
      localStorage.setItem('archetype-lab:events', JSON.stringify([...events, event].slice(-500)));
    } catch {
      /* Analytics must never block the experience. */
    }
  }
}
export const analytics: AnalyticsProvider = new LocalAnalyticsProvider();
export const track = (
  name: AnalyticsEventName,
  sessionId?: string,
  properties?: AnalyticsEvent['properties'],
) => analytics.track({ name, sessionId, properties, at: new Date().toISOString() });
