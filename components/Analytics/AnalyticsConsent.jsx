import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation } from '../routing/SimpleRouter';
import { createBrowserAnalytics } from '../../lib/browserAnalytics.cjs';

let analytics;
function getAnalytics() {
  if (!analytics) analytics = createBrowserAnalytics({ window, document,
    containerId: process.env.GTM_CONTAINER_ID,
    measurementId: process.env.GA4_MEASUREMENT_ID,
    hostname: process.env.ANALYTICS_HOSTNAME });
  return analytics;
}
export default function AnalyticsConsent() {
  const tracker = getAnalytics();
  const { pathname } = useLocation();
  const [consent, setConsent] = useState(tracker.getConsent());
  const [open, setOpen] = useState(consent === null);
  useEffect(() => { tracker.page(pathname); }, [pathname, consent, tracker]);
  useEffect(() => {
    const sync = event => {
      if ((event.key === 'ff.analytics.consent.v1' || event.key === null) && event.newValue !== 'granted') {
        tracker.setConsent('denied');
        setConsent('denied');
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [tracker]);
  if (!tracker.enabled) return null;
  function choose(value) { tracker.setConsent(value); setConsent(value); setOpen(false); }
  return <Panel aria-label='Analytics privacy preferences'>
    {open ? <>
      <strong>Optional analytics</strong>
      <p>Allow Google Analytics to measure which sections you visit? We do not send player searches or account details. Your choice is saved on this device. You can change it anytime.</p>
      <button onClick={() => choose('denied')}>Reject analytics</button>
      <button onClick={() => choose('granted')}>Allow analytics</button>
    </> : <button onClick={() => setOpen(true)}>Analytics preferences</button>}
  </Panel>;
}
const Panel = styled.aside`
  position: fixed; bottom: 1rem; right: 1rem; z-index: 1000;
  max-width: min(28rem, calc(100vw - 2rem)); padding: 1rem;
  background: #10182a; color: #fff; border: 1px solid #64748b; border-radius: .75rem;
  p { line-height: 1.5; }
  button { margin: .25rem; padding: .65rem; color: #fff; background: #24334a; border: 1px solid #94a3b8; border-radius: .3rem; cursor: pointer; }
  button:focus-visible { outline: 3px solid #ff385b; outline-offset: 2px; }
`;
