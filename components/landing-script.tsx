'use client';

import { useEffect } from 'react';

// Ports the landing page's inline <script>: email capture (Formspree),
// nav CTA smooth-scroll, and scroll-reveal animations. Runs against the
// markup injected via dangerouslySetInnerHTML in app/page.tsx.
export default function LandingScript() {
  useEffect(() => {
    const ac = new AbortController();
    const { signal } = ac;

    function wire(formId: string, okId: string) {
      const form = document.getElementById(formId) as HTMLFormElement | null;
      const ok = document.getElementById(okId);
      if (!form || !ok) return;
      form.addEventListener(
        'submit',
        (e) => {
          e.preventDefault();
          const input = form.querySelector(
            'input[name=email]'
          ) as HTMLInputElement | null;
          const value = (input?.value || '').trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            if (input) {
              input.style.borderColor = '#c25c3e';
              input.focus();
            }
            return;
          }
          fetch('https://formspree.io/f/mvzywwvg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email: value })
          }).catch(() => {});
          form.style.display = 'none';
          ok.classList.add('show');
        },
        { signal }
      );
    }

    wire('f1', 'ok1');
    wire('f2', 'ok2');

    const navCta = document.getElementById('navcta');
    navCta?.addEventListener(
      'click',
      () => {
        const el = document.getElementById('f1');
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector('input');
        if (input) setTimeout(() => input.focus(), 460);
      },
      { signal }
    );

    const reveals = document.querySelectorAll('#sah .rv');
    let observer: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              observer!.unobserve(entry.target);
            }
          }),
        { threshold: 0.12 }
      );
      reveals.forEach((el) => {
        if (el.closest('.hero')) el.classList.add('in');
        else observer!.observe(el);
      });
    } else {
      reveals.forEach((el) => el.classList.add('in'));
    }

    return () => {
      ac.abort();
      observer?.disconnect();
    };
  }, []);

  return null;
}
