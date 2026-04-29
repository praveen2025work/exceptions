import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, Edit, Trash2, History as HistoryIcon, RefreshCw, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  BusinessAreaL4ApiError,
  businessAreaL4Service,
} from '@/utils/businessAreaL4Service';
import {
  BusinessAreaL4Entitlement,
  DISCIPLINES,
} from '@/types/businessAreaL4';
import { BusinessAreaL4FormDrawer } from './BusinessAreaL4FormDrawer';
import { BusinessAreaL4HistoryDrawer } from './BusinessAreaL4HistoryDrawer';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const EM_DASH = '—';

type SortField = 'businessAreaL4' | 'updatedOn';
type SortDir = 'asc' | 'desc';

const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return EM_DASH;
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const cellOrDash = (value: string | null | undefined) =>
  value && value.trim().length > 0 ? value : EM_DASH;

export const BusinessAreaL4Entitlements: React.FC = () => {
  const { toast } = useToast();

  const [rows, setRows] = useState<BusinessAreaL4Entitlement[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('updatedOn');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessAreaL4Entitlement | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BusinessAreaL4Entitlement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [historyTarget, setHistoryTarget] = useState<BusinessAreaL4Entitlement | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPageNumber(0);
      setSearchQuery(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await businessAreaL4Service.list({
        page: pageNumber,
        size: PAGE_SIZE,
        sort: `${sortField},${sortDir}`,
        search: searchQuery || undefined,
      });
      setRows(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load entitlements';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, sortField, sortDir, searchQuery, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('asc');
      }
      setPageNumber(0);
    },
    [sortField],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: BusinessAreaL4Entitlement) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await businessAreaL4Service.remove(deleteTarget.id);
      toast({
        title: 'Deleted',
        description: `Removed ${deleteTarget.businessAreaL4}.`,
      });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      const message =
        err instanceof BusinessAreaL4ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to delete entitlement';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return <span className="ml-1 text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  const pageStart = totalElements === 0 ? 0 : pageNumber * PAGE_SIZE + 1;
  const pageEnd = Math.min((pageNumber + 1) * PAGE_SIZE, totalElements);

  const stickyFirstCol = useMemo(
    () =>
      'sticky left-0 z-10 bg-background border-r min-w-[180px] max-w-[220px]',
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Business Area L4 Entitlements
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage L4 → discipline owner / supervisor assignments.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search business area L4..."
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => loadData()}
          aria-label="Refresh"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={stickyFirstCol}>
                <button
                  type="button"
                  onClick={() => handleSort('businessAreaL4')}
                  className="inline-flex items-center font-medium"
                >
                  Business Area L4
                  <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
                  {sortIndicator('businessAreaL4')}
                </button>
              </TableHead>
              {DISCIPLINES.flatMap((d) => [
                <TableHead key={`${d.key}-owner`} className="whitespace-nowrap">
                  {d.label} Owner/Delegate
                </TableHead>,
                <TableHead key={`${d.key}-sup`} className="whitespace-nowrap">
                  {d.label} Supervisor
                </TableHead>,
              ])}
              <TableHead className="whitespace-nowrap">Governance Forum</TableHead>
              <TableHead className="whitespace-nowrap">Updated By</TableHead>
              <TableHead className="whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleSort('updatedOn')}
                  className="inline-flex items-center font-medium"
                >
                  Updated On
                  <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
                  {sortIndicator('updatedOn')}
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={20} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && error && (
              <TableRow>
                <TableCell colSpan={20} className="text-center text-destructive py-8">
                  {error}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={20} className="text-center text-muted-foreground py-8">
                  No entitlements found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className={`${stickyFirstCol} font-medium`}>
                  {row.businessAreaL4}
                </TableCell>
                {DISCIPLINES.flatMap((d) => [
                  <TableCell key={`${row.id}-${d.key}-owner`} className="whitespace-nowrap">
                    {cellOrDash(row[d.ownerDelegateField] as string | null)}
                  </TableCell>,
                  <TableCell key={`${row.id}-${d.key}-sup`} className="whitespace-nowrap">
                    {cellOrDash(row[d.supervisorField] as string | null)}
                  </TableCell>,
                ])}
                <TableCell className="whitespace-nowrap">{cellOrDash(row.governanceForum)}</TableCell>
                <TableCell className="whitespace-nowrap">{cellOrDash(row.updatedBy)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDateTime(row.updatedOn)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="inline-flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(row)}
                      aria-label="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setHistoryTarget(row)}
                      aria-label="View history"
                    >
                      <HistoryIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(row)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalElements === 0
            ? 'No results'
            : `Showing ${pageStart}-${pageEnd} of ${totalElements}`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
            disabled={pageNumber === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm">
            Page {totalPages === 0 ? 0 : pageNumber + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((p) => Math.min(totalPages - 1, p + 1))}
            disabled={pageNumber + 1 >= totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <BusinessAreaL4FormDrawer
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        entitlement={editing}
        onSaved={() => {
          setFormOpen(false);
          setEditing(null);
          loadData();
        }}
      />

      <BusinessAreaL4HistoryDrawer
        open={!!historyTarget}
        onOpenChange={(open) => {
          if (!open) setHistoryTarget(null);
        }}
        entitlement={historyTarget}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entitlement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the entitlement for{' '}
              <span className="font-semibold">
                {deleteTarget?.businessAreaL4}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BusinessAreaL4Entitlements;
