import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BusinessAreaL4Entitlement,
  BusinessAreaL4EntitlementHistory,
  DISCIPLINES,
  BRID_FIELDS,
  RevisionType,
} from '@/types/businessAreaL4';
import { businessAreaL4Service } from '@/utils/businessAreaL4Service';

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const FIELD_LABELS: Record<string, string> = {
  businessAreaL4: 'Business Area L4',
  governanceForum: 'Governance Forum',
};
DISCIPLINES.forEach((d) => {
  FIELD_LABELS[d.ownerDelegateField as string] = `${d.label} Owner/Delegate`;
  FIELD_LABELS[d.supervisorField as string] = `${d.label} Supervisor`;
});

const DIFFABLE_FIELDS: (keyof BusinessAreaL4Entitlement)[] = [
  'businessAreaL4',
  ...BRID_FIELDS,
  'governanceForum',
];

const revisionBadgeVariant = (
  type: RevisionType,
): { className: string; label: string } => {
  switch (type) {
    case 'ADD':
      return {
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        label: 'ADD',
      };
    case 'MOD':
      return {
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
        label: 'MOD',
      };
    case 'DEL':
      return {
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        label: 'DEL',
      };
    default:
      return { className: '', label: type };
  }
};

const valueOrDash = (v: string | null | undefined) =>
  v && String(v).length > 0 ? String(v) : '—';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entitlement: BusinessAreaL4Entitlement | null;
}

export const BusinessAreaL4HistoryDrawer: React.FC<Props> = ({
  open,
  onOpenChange,
  entitlement,
}) => {
  const [history, setHistory] = useState<BusinessAreaL4EntitlementHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !entitlement) {
      setHistory([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    businessAreaL4Service
      .history(entitlement.id)
      .then((data) => {
        if (cancelled) return;
        const sorted = [...data].sort(
          (a, b) => a.revisionNumber - b.revisionNumber,
        );
        setHistory(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load history');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, entitlement]);

  const renderFullSnapshot = (snapshot: BusinessAreaL4Entitlement) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
      {DIFFABLE_FIELDS.map((f) => (
        <div key={f as string} className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {FIELD_LABELS[f as string] ?? (f as string)}
          </span>
          <span>{valueOrDash(snapshot[f] as string | null)}</span>
        </div>
      ))}
    </div>
  );

  const renderDiff = (
    current: BusinessAreaL4Entitlement,
    previous: BusinessAreaL4Entitlement,
  ) => {
    const changes = DIFFABLE_FIELDS.filter((f) => {
      const a = (previous[f] ?? null) as string | null;
      const b = (current[f] ?? null) as string | null;
      return (a ?? '') !== (b ?? '');
    });
    if (changes.length === 0) {
      return (
        <p className="text-sm text-muted-foreground italic">
          No tracked field changes in this revision.
        </p>
      );
    }
    return (
      <div className="space-y-2 text-sm">
        {changes.map((f) => (
          <div key={f as string} className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {FIELD_LABELS[f as string] ?? (f as string)}
            </span>
            <span>
              <span className="line-through text-muted-foreground">
                {valueOrDash(previous[f] as string | null)}
              </span>
              <span className="mx-2">→</span>
              <span className="font-medium">
                {valueOrDash(current[f] as string | null)}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>History</SheetTitle>
          <SheetDescription>
            {entitlement
              ? `Revision history for ${entitlement.businessAreaL4}.`
              : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading history...</p>
          )}
          {!isLoading && error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!isLoading && !error && history.length === 0 && (
            <p className="text-sm text-muted-foreground">No history available.</p>
          )}
          {!isLoading && !error && history.length > 0 && (
            <ol className="relative border-s border-muted pl-6 space-y-6">
              {history
                .slice()
                .reverse()
                .map((rev, idx, arr) => {
                  const previousRev = arr[idx + 1];
                  const badge = revisionBadgeVariant(rev.revisionType);
                  return (
                    <li key={rev.revisionNumber} className="relative">
                      <span className="absolute -left-[33px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={badge.className} variant="outline">
                          {badge.label}
                        </Badge>
                        <span className="text-sm font-medium">
                          Revision #{rev.revisionNumber}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDateTime(rev.revisionTimestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Updated by {rev.snapshot.updatedBy || '—'}
                      </div>
                      <div className="border rounded-md p-3 bg-muted/40">
                        {rev.revisionType === 'MOD' && previousRev
                          ? renderDiff(rev.snapshot, previousRev.snapshot)
                          : renderFullSnapshot(rev.snapshot)}
                      </div>
                      {idx < arr.length - 1 && <Separator className="mt-4" />}
                    </li>
                  );
                })}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BusinessAreaL4HistoryDrawer;
