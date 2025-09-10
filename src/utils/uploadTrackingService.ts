import { UploadTracking, CreateUploadTrackingRequest, UpdateUploadTrackingRequest } from '../types/uploadTracking';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://sqppavdi049806:8089';
const MOCK_MODE = process.env.NEXT_PUBLIC_CO_DEV_ENV === 'mock';

// Mock data for development
const mockUploadTrackingData: UploadTracking[] = [
  {
    id: 1,
    uploadType: 'manual_exception',
    updatedBy: 'kumarp15',
    createdBy: 'smithj22',
    fileName: 'exceptions_batch_001.csv',
    status: 'completed',
    count: 150,
    createdAt: '2025-09-10T12:00:00',
    updatedAt: '2025-09-10T13:15:00'
  },
  {
    id: 2,
    uploadType: 'user_entitlements',
    updatedBy: 'x8034242',
    createdBy: 'hrmanager01',
    fileName: 'user_permissions_Q3.xlsx',
    status: 'processing',
    count: 2500,
    createdAt: '2025-09-10T12:05:00',
    updatedAt: '2025-09-10T12:30:00'
  },
  {
    id: 3,
    uploadType: 'sla_update',
    updatedBy: 'systemadmin',
    createdBy: 'slamanager',
    fileName: 'sla_config_update.json',
    status: 'failed',
    count: 0,
    createdAt: '2025-09-10T14:00:00',
    updatedAt: '2025-09-10T14:05:00'
  },
  {
    id: 4,
    uploadType: 'manual_exception',
    updatedBy: undefined,
    createdBy: 'analyst01',
    fileName: 'exceptions_batch_002.csv',
    status: 'pending',
    count: 75,
    createdAt: '2025-09-10T15:30:00',
    updatedAt: '2025-09-10T15:30:00'
  },
  {
    id: 5,
    uploadType: 'user_entitlements',
    updatedBy: 'hrmanager01',
    createdBy: 'hrmanager01',
    fileName: 'new_user_setup.xlsx',
    status: 'completed',
    count: 45,
    createdAt: '2025-09-10T16:00:00',
    updatedAt: '2025-09-10T16:15:00'
  }
];

let mockIdCounter = 6;

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const uploadTrackingService = {
  // Get all upload tracking records
  async getAll(): Promise<UploadTracking[]> {
    if (MOCK_MODE) {
      await delay(500);
      return [...mockUploadTrackingData];
    }

    const response = await fetch(`${API_BASE_URL}/api/uploads`);
    if (!response.ok) {
      throw new Error('Failed to fetch upload tracking records');
    }
    return response.json();
  },

  // Get upload tracking record by ID
  async getById(id: number): Promise<UploadTracking> {
    if (MOCK_MODE) {
      await delay(300);
      const record = mockUploadTrackingData.find(item => item.id === id);
      if (!record) {
        throw new Error('Not found');
      }
      return { ...record };
    }

    const response = await fetch(`${API_BASE_URL}/api/uploads/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Not found');
      }
      throw new Error('Failed to fetch upload tracking record');
    }
    return response.json();
  },

  // Create new upload tracking record
  async create(data: CreateUploadTrackingRequest): Promise<UploadTracking> {
    if (MOCK_MODE) {
      await delay(800);
      const now = new Date().toISOString();
      // Simulate backend auto-population of fields
      const newRecord: UploadTracking = {
        id: mockIdCounter++,
        uploadType: data.uploadType,
        updatedBy: undefined, // Auto-populated by backend
        createdBy: 'mockuser01', // Auto-populated by backend based on logged-in user
        fileName: data.fileName,
        status: 'pending', // Auto-populated by backend
        count: Math.floor(Math.random() * 1000) + 1, // Auto-populated by backend after processing file
        createdAt: now,
        updatedAt: now
      };
      mockUploadTrackingData.unshift(newRecord);
      return { ...newRecord };
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('uploadType', data.uploadType);
    formData.append('fileName', data.fileName);
    
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await fetch(`${API_BASE_URL}/api/uploads`, {
      method: 'POST',
      body: formData, // Don't set Content-Type header, let browser set it with boundary
    });

    if (!response.ok) {
      throw new Error('Failed to create upload tracking record');
    }
    return response.json();
  },

  // Update upload tracking record
  async update(id: number, data: UpdateUploadTrackingRequest): Promise<UploadTracking> {
    if (MOCK_MODE) {
      await delay(600);
      const index = mockUploadTrackingData.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error('Not found');
      }
      
      const updatedRecord: UploadTracking = {
        ...mockUploadTrackingData[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      mockUploadTrackingData[index] = updatedRecord;
      return { ...updatedRecord };
    }

    const response = await fetch(`${API_BASE_URL}/api/uploads/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Not found');
      }
      throw new Error('Failed to update upload tracking record');
    }
    return response.json();
  },

  // Delete upload tracking record
  async delete(id: number): Promise<void> {
    if (MOCK_MODE) {
      await delay(400);
      const index = mockUploadTrackingData.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error('Not found');
      }
      mockUploadTrackingData.splice(index, 1);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/uploads/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Not found');
      }
      throw new Error('Failed to delete upload tracking record');
    }
  }
};