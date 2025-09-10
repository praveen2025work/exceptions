export interface UploadTracking {
  id: number;
  uploadType: 'manual_exception' | 'user_entitlements' | 'sla_update';
  updatedBy?: string;
  createdBy: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUploadTrackingRequest {
  uploadType: 'manual_exception' | 'user_entitlements' | 'sla_update';
  fileName: string;
  file?: File;
}

export interface UpdateUploadTrackingRequest {
  uploadType: 'manual_exception' | 'user_entitlements' | 'sla_update';
  updatedBy?: string;
  createdBy: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  count: number;
}