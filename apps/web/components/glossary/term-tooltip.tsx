'use client';

import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  type GlossaryTermId,
  GLOSSARY,
  glossaryDisplayLabel,
} from '@/lib/glossary';

type TermTooltipProps = {
  term: GlossaryTermId;
  children: ReactNode;
  className?: string;
  /** When true, renders as inline eyebrow-style label */
  asLabel?: boolean;
};

export function TermTooltip({ term, children, className, asLabel = false }: TermTooltipProps) {
  const display = glossaryDisplayLabel(term);
  const definition = GLOSSARY[term];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'cursor-help border-b border-dotted border-ink-muted/40 decoration-ink-muted/40 underline-offset-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
            asLabel && 'eyebrow border-b-0 underline decoration-dotted underline-offset-2',
            className,
          )}
          tabIndex={0}
          aria-label={`${display}: ${definition}`}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-left leading-snug">
        <span className="font-medium">{display}</span>
        <span className="text-background/90"> - {definition}</span>
      </TooltipContent>
    </Tooltip>
  );
}

type FieldLabelProps = {
  term?: GlossaryTermId;
  children: ReactNode;
  className?: string;
  variant?: 'eyebrow' | 'default';
};

/** Eyebrow field label with optional glossary term */
export function FieldLabel({
  term,
  children,
  className,
  variant = 'eyebrow',
}: FieldLabelProps) {
  if (!term) {
    return (
      <span className={cn(variant === 'eyebrow' && 'eyebrow', className)}>{children}</span>
    );
  }

  return (
    <TermTooltip term={term} asLabel={variant === 'eyebrow'} className={className}>
      {children}
    </TermTooltip>
  );
}

type DocumentTypeBadgeProps = {
  type: string;
};

export function DocumentTypeBadge({ type }: DocumentTypeBadgeProps) {
  const term = type as GlossaryTermId;
  if (!(term in GLOSSARY)) {
    return <span>{type}</span>;
  }

  return (
    <TermTooltip term={term}>
      <span>{type}</span>
    </TermTooltip>
  );
}
