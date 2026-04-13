import { supabase } from './supabase';

type EventName =
  | 'page_view'
  | 'cta_click'
  | 'newsletter_submit'
  | 'newsletter_success'
  | 'newsletter_error';

type EventProperties = Record<string, string | number | boolean>;

export function trackEvent(name: EventName, properties?: EventProperties) {
  if (typeof window === 'undefined') return;

  const payload = {
    event: name,
    properties: {
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      ...properties,
    },
  };

  if (import.meta.env.DEV) {
    console.debug('[Analytics]', payload);
    return;
  }

  supabase
    .from('analytics_events')
    .insert([{ event: payload.event, properties: payload.properties }])
    .then(({ error }) => {
      if (error) console.error('[Analytics] insert failed:', error.message);
    });
}

export function trackPageView(page: string) {
  trackEvent('page_view', { page });
}

export function trackCTAClick(label: string, destination: string) {
  trackEvent('cta_click', { label, destination });
}
