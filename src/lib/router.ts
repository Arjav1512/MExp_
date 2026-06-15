import { useState, useEffect } from 'react';
import { trackPageView } from './analytics';

export type Page = 'home' | 'mission';

export function useRouter(): [Page, (page: Page) => void] {
  const getPage = (): Page => {
    return window.location.hash === '#mission' ? 'mission' : 'home';
  };

  const [page, setPageState] = useState<Page>(getPage);

  useEffect(() => {
    trackPageView(getPage());
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const p = getPage();
      setPageState(p);
      trackPageView(p);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (target: Page) => {
    const newHash = target === 'home' ? '' : target;
    if (window.location.hash.replace('#', '') === newHash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = newHash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return [page, navigate];
}
