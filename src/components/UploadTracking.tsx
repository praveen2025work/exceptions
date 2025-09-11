import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useLoading } from '@/contexts/LoadingContext';
import { useUser } from '@/contexts/UserContext';
import { UploadTracking as UploadTrackingType, CreateUploadTrackingRequest, UpdateUploadTrackingRequest } from '@/types/uploadTracking';
import { uploadTrackingService } from '@/utils/uploadTrackingService';

const UPLOAD_TYPES = [
  { value: 'manual_exception', label: 'Manual Exception' },
  { value: 'user_entitlements', label: 'User Entitlements' },
  { value: 'sla_update', label: 'SLA Update' }
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'pending':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatUploadType = (type: string) => {
  return UPLOAD_TYPES.find(t => t.value === type)?.label || type;
};

interface FormData {
  uploadType: string;
  updatedBy: string;
  createdBy: string;
  fileName: string;
  status: string;
  count: string;
}

const initialFormData: FormData = {
  uploadType: '',
  updatedBy: '',
  createdBy: '',
  fileName: '',
  status: 'pending',
  count: '0'
};

interface CreateFormData {
  uploadType: string;
  fileName: string;
}

const initialCreateFormData: CreateFormData = {
  uploadType: '',
  fileName: ''
};

export const UploadTracking: React.FC = React.memo(() => {
  const [records, setRecords] = useState<UploadTrackingType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof UploadTrackingType>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<UploadTrackingType | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [createFormData, setCreateFormData] = useState<CreateFormData>(initialCreateFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [createFormErrors, setCreateFormErrors] = useState<Partial<CreateFormData>>({});

  const { toast } = useToast();
  const { withLoading } = useLoading();
  const { user } = useUser();

  const itemsPerPage = 10;

  // Load data
  const loadData = useCallback(async () => {
    try {
      const data = await uploadTrackingService.getAll();
      setRecords(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load upload tracking records',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    withLoading(loadData());
  }, [withLoading, loadData]);

  // Filter and sort records
  const processedRecords = useMemo(() => {
    let filtered = records.filter(record =>
      record.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.updatedBy?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      formatUploadType(record.uploadType).toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [records, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedRecords.length / itemsPerPage);
  const paginatedRecords = processedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = useCallback((field: keyof UploadTrackingType) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Form validation for edit
  const validateForm = (data: FormData): Partial<FormData> => {
    const errors: Partial<FormData> = {};
    
    if (!data.uploadType) errors.uploadType = 'Upload type is required';
    if (!data.createdBy) errors.createdBy = 'Created by is required';
    if (!data.fileName) errors.fileName = 'File name is required';
    if (!data.status) errors.status = 'Status is required';
    if (!data.count || isNaN(Number(data.count)) || Number(data.count) < 0) {
      errors.count = 'Count must be a valid number >= 0';
    }
    
    return errors;
  };

  // Form validation for create
  const validateCreateForm = (data: CreateFormData): Partial<CreateFormData> => {
    const errors: Partial<CreateFormData> = {};
    
    if (!data.uploadType) errors.uploadType = 'Upload type is required';
    if (!data.fileName) errors.fileName = 'File name is required';
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (isEditing && selectedRecord) {
      // For updates
      const errors = validateForm(formData);
      setFormErrors(errors);
      
      if (Object.keys(errors).length > 0) {
        return;
      }

      const updateData: UpdateUploadTrackingRequest = {
        uploadType: formData.uploadType as any,
        updatedBy: formData.updatedBy || undefined,
        createdBy: formData.createdBy,
        fileName: formData.fileName,
        status: formData.status as any,
        count: Number(formData.count)
      };

      try {
        await withLoading(uploadTrackingService.update(selectedRecord.id, updateData));
        toast({
          title: 'Success',
          description: 'Upload tracking record updated successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update upload tracking record',
          variant: 'destructive',
        });
        return;
      }
    } else {
      // For creates
      const errors = validateCreateForm(createFormData);
      setCreateFormErrors(errors);
      
      if (Object.keys(errors).length > 0) {
        return;
      }

      const requestData: CreateUploadTrackingRequest = {
        uploadType: createFormData.uploadType as any,
        fileName: createFormData.fileName,
        file: selectedFile || undefined
      };

      try {
        await withLoading(uploadTrackingService.create(requestData));
        toast({
          title: 'Success',
          description: 'Upload tracking record created successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create upload tracking record',
          variant: 'destructive',
        });
        return;
      }
    }
    
    setIsFormOpen(false);
    setFormData(initialFormData);
    setCreateFormData(initialCreateFormData);
    setSelectedFile(null);
    setFormErrors({});
    setCreateFormErrors({});
    setIsEditing(false);
    setSelectedRecord(null);
    await loadData();
  }, [formData, createFormData, selectedFile, isEditing, selectedRecord, withLoading, toast, loadData]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!selectedRecord) return;

    try {
      await withLoading(uploadTrackingService.delete(selectedRecord.id));
      toast({
        title: 'Success',
        description: 'Upload tracking record deleted successfully',
      });
      setIsDeleteOpen(false);
      setSelectedRecord(null);
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete upload tracking record',
        variant: 'destructive',
      });
    }
  }, [selectedRecord, withLoading, toast, loadData]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate filename from the uploaded file
      setCreateFormData(prev => ({ ...prev, fileName: file.name }));
    }
  }, []);

  // Open create form
  const openCreateForm = useCallback(() => {
    setCreateFormData(initialCreateFormData);
    setSelectedFile(null);
    setCreateFormErrors({});
    setIsEditing(false);
    setSelectedRecord(null);
    setIsFormOpen(true);
  }, []);

  // Open edit form
  const openEditForm = useCallback((record: UploadTrackingType) => {
    setFormData({
      uploadType: record.uploadType,
      updatedBy: user?.userName || record.updatedBy || '',
      createdBy: record.createdBy,
      fileName: record.fileName,
      status: record.status,
      count: record.count.toString()
    });
    setSelectedFile(null); // Reset file selection for editing
    setFormErrors({});
    setIsEditing(true);
    setSelectedRecord(record);
    setIsFormOpen(true);
  }, [user]);

  // Open detail view
  const openDetailView = useCallback((record: UploadTrackingType) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  }, []);

  // Open delete confirmation
  const openDeleteConfirmation = useCallback((record: UploadTrackingType) => {
    setSelectedRecord(record);
    setIsDeleteOpen(true);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    withLoading(loadData());
  }, [withLoading, loadData]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Upload
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by file name, created by, updated by, type, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('id')}
                  >
                    ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('fileName')}
                  >
                    File Name {sortField === 'fileName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('uploadType')}
                  >
                    Type {sortField === 'uploadType' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('count')}
                  >
                    Count {sortField === 'count' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('createdBy')}
                  >
                    Created By {sortField === 'createdBy' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('createdAt')}
                  >
                    Created At {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{record.id}</TableCell>
                    <TableCell className="max-w-xs truncate" title={record.fileName}>
                      {record.fileName}
                    </TableCell>
                    <TableCell>{formatUploadType(record.uploadType)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.count.toLocaleString()}</TableCell>
                    <TableCell>{record.createdBy}</TableCell>
                    <TableCell>{formatDateTime(record.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailView(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteConfirmation(record)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Upload Tracking Record' : 'Create Upload Tracking Record'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the upload tracking record details.' : 'Add a new upload tracking record to the system.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="uploadType">Upload Type *</Label>
              <Select
                value={isEditing ? formData.uploadType : createFormData.uploadType}
                onValueChange={(value) => {
                  if (isEditing) {
                    setFormData(prev => ({ ...prev, uploadType: value }));
                  } else {
                    setCreateFormData(prev => ({ ...prev, uploadType: value }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select upload type" />
                </SelectTrigger>
                <SelectContent>
                  {UPLOAD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(isEditing ? formErrors.uploadType : createFormErrors.uploadType) && (
                <p className="text-sm text-red-500">
                  {isEditing ? formErrors.uploadType : createFormErrors.uploadType}
                </p>
              )}
            </div>

            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="fileUpload">Upload File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fileUpload"
                    type="file"
                    onChange={handleFileSelect}
                    className="flex-1"
                    accept=".csv,.xlsx,.xls,.txt,.dat"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="fileName">File Name *</Label>
              <Input
                id="fileName"
                value={isEditing ? formData.fileName : createFormData.fileName}
                onChange={(e) => {
                  if (isEditing) {
                    setFormData(prev => ({ ...prev, fileName: e.target.value }));
                  } else {
                    setCreateFormData(prev => ({ ...prev, fileName: e.target.value }));
                  }
                }}
                placeholder="Enter file name"
              />
              {(isEditing ? formErrors.fileName : createFormErrors.fileName) && (
                <p className="text-sm text-red-500">
                  {isEditing ? formErrors.fileName : createFormErrors.fileName}
                </p>
              )}
            </div>

            {isEditing && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.status && (
                    <p className="text-sm text-red-500">{formErrors.status}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="count">Count *</Label>
                  <Input
                    id="count"
                    type="number"
                    min="0"
                    value={formData.count}
                    onChange={(e) => setFormData(prev => ({ ...prev, count: e.target.value }))}
                    placeholder="Enter count"
                  />
                  {formErrors.count && (
                    <p className="text-sm text-red-500">{formErrors.count}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="createdBy">Created By *</Label>
                  <Input
                    id="createdBy"
                    value={formData.createdBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                    placeholder="Enter created by"
                  />
                  {formErrors.createdBy && (
                    <p className="text-sm text-red-500">{formErrors.createdBy}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="updatedBy">Updated By</Label>
                  <Input
                    id="updatedBy"
                    value={formData.updatedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, updatedBy: e.target.value }))}
                    placeholder="Enter updated by (optional)"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Tracking Details</DialogTitle>
            <DialogDescription>
              View detailed information about this upload tracking record.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID</Label>
                  <p className="text-sm">{selectedRecord.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedRecord.status)}>
                    {selectedRecord.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">File Name</Label>
                <p className="text-sm break-all">{selectedRecord.fileName}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Upload Type</Label>
                <p className="text-sm">{formatUploadType(selectedRecord.uploadType)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Count</Label>
                  <p className="text-sm">{selectedRecord.count.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                  <p className="text-sm">{selectedRecord.createdBy}</p>
                </div>
              </div>
              
              {selectedRecord.updatedBy && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Updated By</Label>
                  <p className="text-sm">{selectedRecord.updatedBy}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                  <p className="text-sm">{formatDateTime(selectedRecord.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Updated At</Label>
                  <p className="text-sm">{formatDateTime(selectedRecord.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the upload tracking record
              {selectedRecord && ` "${selectedRecord.fileName}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

UploadTracking.displayName = 'UploadTracking';