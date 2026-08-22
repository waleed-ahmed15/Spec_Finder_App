'use client';

import { useMemo } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  APPLICATION_LABELS,
  CATEGORY_LABELS,
  FIRE_OPTIONS,
  MOISTURE_LABELS,
} from '@/lib/query-params';
import { useProductFilters } from '@/hooks/use-specification';

export function ActiveFilterChips() {
  const [filters, setFilters] = useProductFilters();

  const chips = useMemo(() => {
    const items: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (filters.q) {
      items.push({
        key: 'q',
        label: `Search: ${filters.q}`,
        onRemove: () => setFilters({ q: null, page: 1 }),
      });
    }

    for (const app of filters.application ?? []) {
      items.push({
        key: `application-${app}`,
        label: APPLICATION_LABELS[app as keyof typeof APPLICATION_LABELS] ?? app,
        onRemove: () =>
          setFilters({
            application: (filters.application ?? []).filter((value) => value !== app),
            page: 1,
          }),
      });
    }

    if (filters.fireMin) {
      const label = FIRE_OPTIONS.find((option) => option.value === String(filters.fireMin))?.label;
      items.push({
        key: 'fireMin',
        label: label ?? `EI ${filters.fireMin}`,
        onRemove: () => setFilters({ fireMin: null, page: 1 }),
      });
    }

    if (filters.rwMin && filters.rwMin > 30) {
      items.push({
        key: 'rwMin',
        label: `Rw ≥ ${filters.rwMin} dB`,
        onRemove: () => setFilters({ rwMin: null, page: 1 }),
      });
    }

    if (filters.moisture && filters.moisture !== 'none') {
      items.push({
        key: 'moisture',
        label:
          MOISTURE_LABELS[filters.moisture as keyof typeof MOISTURE_LABELS] ?? filters.moisture,
        onRemove: () => setFilters({ moisture: null, page: 1 }),
      });
    }

    for (const category of filters.category ?? []) {
      items.push({
        key: `category-${category}`,
        label: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category,
        onRemove: () =>
          setFilters({
            category: (filters.category ?? []).filter((value) => value !== category),
            page: 1,
          }),
      });
    }

    return items;
  }, [filters, setFilters]);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 bg-primary-tint text-ink">
          {chip.label}
          <button
            type="button"
            aria-label={`Remove ${chip.label} filter`}
            className="rounded-sm p-0.5 hover:bg-primary/10"
            onClick={chip.onRemove}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          setFilters({
            q: null,
            application: [],
            fireMin: null,
            rwMin: null,
            moisture: null,
            category: [],
            page: 1,
          })
        }
      >
        Clear all
      </Button>
    </div>
  );
}
