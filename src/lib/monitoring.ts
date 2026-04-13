import { supabase } from './supabase';

type ErrorReport = {
  message: string;
  stack?: string;
  source: string;
  timestamp: string;
  url: string;
  userAgent: string;
};

function report(error: Error | string, source: string) {
  const entry: ErrorReport = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    source,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  console.error('[Monitoring]', entry);

  if (!import.meta.env.DEV) {
    supabase
      .from('error_logs')
      .insert([{
        message: entry.message,
        stack: entry.stack ?? null,
        source: entry.source,
        url: entry.url,
        user_agent: entry.userAgent,
      }])
      .then(({ error: dbError }) => {
        if (dbError) console.error('[Monitoring] log failed:', dbError.message);
      });
  }
}

export function initMonitoring() {
  window.addEventListener('error', (event) => {
    report(event.error ?? new Error(event.message), 'window.onerror');
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    report(
      reason instanceof Error ? reason : new Error(String(reason)),
      'unhandledrejection'
    );
  });
}

export function captureError(error: Error | string, context?: string) {
  report(error, context ?? 'manual');
}
