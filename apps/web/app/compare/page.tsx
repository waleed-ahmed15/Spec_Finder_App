import { SiteHeader } from '@/components/layout/site-header';
import { CompareView } from '@/components/compare/compare-view';

export const dynamic = 'force-dynamic';

export default function ComparePage() {
  return (
    <>
      <SiteHeader />
      <CompareView />
    </>
  );
}
