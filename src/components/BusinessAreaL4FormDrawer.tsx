import React, { useEffect, useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  BusinessAreaL4Entitlement,
  BusinessAreaL4EntitlementRequest,
  DISCIPLINES,
  BRID_FIELDS,
} from '@/types/businessAreaL4';
import {
  BusinessAreaL4ApiError,
  businessAreaL4Service,
} from '@/utils/businessAreaL4Service';

const MAX_L4 = 100;
const MAX_BRID = 50;

type FormState = {
  businessAreaL4: string;
  governanceForum: string;
} & Record<(typeof BRID_FIELDS)[number], string>;

const emptyForm = (): FormState => {
  const base = {
    businessAreaL4: '',
    governanceForum: '',
  } as FormState;
  BRID_FIELDS.forEach((f) => {
    base[f] = '';
  });
  return base;
};

const fromEntitlement = (e: BusinessAreaL4Entitlement): FormState => {
  const state = emptyForm();
  state.businessAreaL4 = e.businessAreaL4 ?? '';
  state.governanceForum = e.governanceForum ?? '';
  BRID_FIELDS.forEach((f) => {
    state[f] = (e[f] as string | null) ?? '';
  });
  return state;
};

const toRequest = (state: FormState): BusinessAreaL4EntitlementRequest => {
  const payload = {
    businessAreaL4: state.businessAreaL4.trim().toUpperCase(),
    governanceForum: state.governanceForum.trim() || null,
  } as BusinessAreaL4EntitlementRequest;
  BRID_FIELDS.forEach((f) => {
    const v = state[f].trim();
    (payload as Record<string, string | null>)[f as string] = v.length > 0 ? v : null;
  });
  return payload;
};

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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entitlement: BusinessAreaL4Entitlement | null;
  onSaved: (saved: BusinessAreaL4Entitlement) => void;
}

export const BusinessAreaL4FormDrawer: React.FC<Props> = ({
  open,
  onOpenChange,
  entitlement,
  onSaved,
}) => {
  const { toast } = useToast();
  const isEdit = !!entitlement;

  const [form, setForm] = useState<FormState>(emptyForm());
  const [initial, setInitial] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next = entitlement ? fromEntitlement(entitlement) : emptyForm();
    setForm(next);
    setInitial(next);
    setErrors({});
  }, [open, entitlement]);

  const isPristine = useMemo(
    () => JSON.stringify(form) === JSON.stringify(initial),
    [form, initial],
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const trimGidOnBlur = (key: keyof FormState) => {
    setForm((prev) => ({ ...prev, [key]: (prev[key] as string).trim() }));
  };

  const upperL4OnBlur = () => {
    setForm((prev) => ({
      ...prev,
      businessAreaL4: prev.businessAreaL4.trim().toUpperCase(),
    }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    const l4 = form.businessAreaL4.trim();
    if (!l4) {
      next.businessAreaL4 = 'Business Area L4 is required';
    } else if (l4.length > MAX_L4) {
      next.businessAreaL4 = `Max ${MAX_L4} characters`;
    }
    BRID_FIELDS.forEach((f) => {
      const v = form[f].trim();
      if (v.length > MAX_BRID) {
        next[f] = `Max ${MAX_BRID} characters`;
      }
    });
    if (form.governanceForum.trim().length > MAX_BRID) {
      next.governanceForum = `Max ${MAX_BRID} characters`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = toRequest(form);
      const saved = isEdit && entitlement
        ? await businessAreaL4Service.update(entitlement.id, payload)
        : await businessAreaL4Service.create(payload);
      toast({
        title: isEdit ? 'Updated' : 'Created',
        description: `Saved ${saved.businessAreaL4}.`,
      });
      onSaved(saved);
    } catch (err) {
      if (err instanceof BusinessAreaL4ApiError) {
        if (err.status === 409 || err.code === 'DUPLICATE_BUSINESS_AREA_L4') {
          setErrors((prev) => ({
            ...prev,
            businessAreaL4: 'Already exists',
          }));
        } else if (err.status === 400 && err.fieldErrors?.length) {
          const mapped: Partial<Record<keyof FormState, string>> = {};
          err.fieldErrors.forEach((fe) => {
            mapped[fe.field as keyof FormState] = fe.message;
          });
          setErrors((prev) => ({ ...prev, ...mapped }));
          toast({
            title: 'Validation error',
            description: err.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: err.message,
            variant: 'destructive',
          });
        }
      } else {
        const message = err instanceof Error ? err.message : 'Failed to save';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto" side="right">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>
              {isEdit ? 'Edit Entitlement' : 'New Entitlement'}
            </SheetTitle>
            <SheetDescription>
              {isEdit
                ? `Update assignments for ${entitlement?.businessAreaL4}.`
                : 'Create a new Business Area L4 entitlement.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 py-4 space-y-6">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">L4</h3>
              <div className="space-y-1">
                <Label htmlFor="businessAreaL4">
                  Business Area L4 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="businessAreaL4"
                  value={form.businessAreaL4}
                  onChange={(e) => setField('businessAreaL4', e.target.value)}
                  onBlur={upperL4OnBlur}
                  maxLength={MAX_L4}
                  aria-invalid={!!errors.businessAreaL4}
                />
                {errors.businessAreaL4 && (
                  <p className="text-xs text-destructive">{errors.businessAreaL4}</p>
                )}
              </div>
            </section>

            <Separator />

            {DISCIPLINES.map((d) => (
              <section key={d.key} className="space-y-2">
                <h3 className="text-sm font-semibold">{d.label}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`${d.key}-owner`}>Owner / Delegate</Label>
                    <Input
                      id={`${d.key}-owner`}
                      value={form[d.ownerDelegateField as keyof FormState] as string}
                      onChange={(e) =>
                        setField(
                          d.ownerDelegateField as keyof FormState,
                          e.target.value,
                        )
                      }
                      onBlur={() => trimGidOnBlur(d.ownerDelegateField as keyof FormState)}
                      maxLength={MAX_BRID}
                      placeholder="BRID"
                      aria-invalid={!!errors[d.ownerDelegateField as keyof FormState]}
                    />
                    {errors[d.ownerDelegateField as keyof FormState] && (
                      <p className="text-xs text-destructive">
                        {errors[d.ownerDelegateField as keyof FormState]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${d.key}-sup`}>Supervisor</Label>
                    <Input
                      id={`${d.key}-sup`}
                      value={form[d.supervisorField as keyof FormState] as string}
                      onChange={(e) =>
                        setField(
                          d.supervisorField as keyof FormState,
                          e.target.value,
                        )
                      }
                      onBlur={() => trimGidOnBlur(d.supervisorField as keyof FormState)}
                      maxLength={MAX_BRID}
                      placeholder="BRID"
                      aria-invalid={!!errors[d.supervisorField as keyof FormState]}
                    />
                    {errors[d.supervisorField as keyof FormState] && (
                      <p className="text-xs text-destructive">
                        {errors[d.supervisorField as keyof FormState]}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ))}

            <Separator />

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Governance</h3>
              <div className="space-y-1">
                <Label htmlFor="governanceForum">Governance Forum</Label>
                <Input
                  id="governanceForum"
                  value={form.governanceForum}
                  onChange={(e) => setField('governanceForum', e.target.value)}
                  onBlur={() => trimGidOnBlur('governanceForum')}
                  maxLength={MAX_BRID}
                  placeholder="BRID"
                  aria-invalid={!!errors.governanceForum}
                />
                {errors.governanceForum && (
                  <p className="text-xs text-destructive">{errors.governanceForum}</p>
                )}
              </div>
            </section>

            {isEdit && entitlement && (
              <>
                <Separator />
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Audit</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-muted-foreground text-xs">Created By</Label>
                      <div>{entitlement.createdBy || '—'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Created On</Label>
                      <div>{formatDateTime(entitlement.createdOn)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Updated By</Label>
                      <div>{entitlement.updatedBy || '—'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Updated On</Label>
                      <div>{formatDateTime(entitlement.updatedOn)}</div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>

          <SheetFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || isPristine}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default BusinessAreaL4FormDrawer;
