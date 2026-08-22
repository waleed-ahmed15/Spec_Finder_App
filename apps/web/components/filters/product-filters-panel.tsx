'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FieldLabel, TermTooltip } from '@/components/glossary/term-tooltip';
import { APPLICATION_LABELS, CATEGORY_LABELS, FIRE_OPTIONS } from '@/lib/query-params';
import { useProductFilters } from '@/hooks/use-specification';
import type { GlossaryTermId } from '@/lib/glossary';
import type { Application, ProductCategory } from '@specfinder/shared';

function FilterSection({
  title,
  term,
  children,
  value,
}: {
  title: string;
  term?: GlossaryTermId;
  children: React.ReactNode;
  value: string;
}) {
  const legend = term ? <FieldLabel term={term}>{title}</FieldLabel> : title;

  return (
    <>
      <div className="hidden space-y-3 md:block">
        <fieldset>
          <legend className="mb-2 block">{legend}</legend>
          {children}
        </fieldset>
      </div>
      <Accordion type="single" collapsible className="md:hidden">
        <AccordionItem value={value}>
          <AccordionTrigger className="text-sm">{title}</AccordionTrigger>
          <AccordionContent>{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

export function ProductFiltersPanel() {
  const [filters, setFilters] = useProductFilters();
  const rwValue = filters.rwMin ?? 30;

  return (
    <div className="space-y-5">
      <FilterSection title="Application" value="application">
        <ToggleGroup
          type="multiple"
          variant="outline"
          className="flex flex-wrap justify-start gap-2"
          value={filters.application ?? []}
          onValueChange={(value) => setFilters({ application: value, page: 1 })}
        >
          {(Object.keys(APPLICATION_LABELS) as Application[]).map((application) => (
            <ToggleGroupItem
              key={application}
              value={application}
              aria-label={APPLICATION_LABELS[application]}
              className="min-h-11 px-3"
            >
              {APPLICATION_LABELS[application]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterSection>

      <FilterSection title="Fire resistance" term="EI" value="fire">
        <RadioGroup
          value={filters.fireMin ? String(filters.fireMin) : ''}
          onValueChange={(value) => setFilters({ fireMin: value ? Number(value) : null, page: 1 })}
        >
          {FIRE_OPTIONS.map((option) => (
            <div key={option.value || 'none'} className="flex items-center gap-2">
              <RadioGroupItem
                value={option.value}
                id={`fire-${option.value || 'none'}`}
                aria-label={option.label}
              />
              <Label htmlFor={`fire-${option.value || 'none'}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Sound insulation" term="Rw" value="rw">
        <div className="space-y-3">
          <p className="font-data text-sm">
            Rw ≥ <span className="text-primary">{rwValue}</span> dB
          </p>
          <Slider
            min={30}
            max={65}
            step={1}
            value={[rwValue]}
            onValueChange={([value]) => setFilters({ rwMin: value === 30 ? null : value, page: 1 })}
            aria-valuetext={`${rwValue} decibels`}
            aria-label="Minimum sound insulation Rw"
          />
        </div>
      </FilterSection>

      <FilterSection title="Moisture exposure" value="moisture">
        <div className="space-y-2">
          <Select
            value={filters.moisture ?? 'none'}
            onValueChange={(value) =>
              setFilters({ moisture: value === 'none' ? null : value, page: 1 })
            }
          >
            <SelectTrigger className="w-full" aria-label="Moisture exposure class">
              <SelectValue placeholder="Select exposure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Dry</SelectItem>
              <SelectItem value="H2">Damp (H2)</SelectItem>
              <SelectItem value="H3">Wet (H3)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-ink-muted">
            <TermTooltip term="H2">H2</TermTooltip> = damp areas ·{' '}
            <TermTooltip term="H3">H3</TermTooltip> = wet rooms
          </p>
        </div>
      </FilterSection>

      <FilterSection title="Category" value="category">
        <div className="space-y-2">
          {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((category) => {
            const checked = (filters.category ?? []).includes(category);
            return (
              <div key={category} className="flex items-center gap-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={checked}
                  onCheckedChange={(next) => {
                    const current = filters.category ?? [];
                    const updated = next
                      ? [...current, category]
                      : current.filter((value) => value !== category);
                    setFilters({ category: updated, page: 1 });
                  }}
                />
                <Label htmlFor={`category-${category}`}>{CATEGORY_LABELS[category]}</Label>
              </div>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}
