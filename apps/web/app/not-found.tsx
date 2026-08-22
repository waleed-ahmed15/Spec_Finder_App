import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display mb-2 text-2xl font-semibold">Page not found</h1>
      <p className="mb-6 text-ink-muted">
        The product or page you requested does not exist in this catalogue.
      </p>
      <Button asChild>
        <Link href="/products">Back to products</Link>
      </Button>
    </main>
  );
}
