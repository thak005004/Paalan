import { landingHtml } from '@/lib/landing-html';
import LandingScript from '@/components/landing-script';

// Public marketing landing page (the original Paalan design). The interactive
// app dashboard lives at /app. The markup is the self-contained, scoped (#sah)
// landing; LandingScript wires up the forms and reveal animations.
export default function HomePage() {
  return (
    <>
      <div id="sah" dangerouslySetInnerHTML={{ __html: landingHtml }} />
      <LandingScript />
    </>
  );
}
