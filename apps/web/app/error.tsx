'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display mb-2 text-2xl font-semibold">Something failed to load</h1>
      <p className="mb-6 text-ink-muted">
        The page could not be rendered. Retry or return to the product list.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Retry</Button>
        <Button variant="outline" asChild>
          <Link href="/products">Back to products</Link>
        </Button>
      </div>
    </main>
  );
}
