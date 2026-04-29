import {
  ApiError,
  BusinessAreaL4Entitlement,
  BusinessAreaL4EntitlementHistory,
  BusinessAreaL4EntitlementRequest,
  PageResponse,
} from '@/types/businessAreaL4';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_EXCEPTION_API_URL || 'http://sqppavdi049806:8089';
const RESOURCE_PATH = '/api/v1/entitlements/business-area-l4';
const MOCK_MODE = process.env.NEXT_PUBLIC_CO_DEV_ENV === 'mock';

export class BusinessAreaL4ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: { field: string; message: string }[];

  constructor(payload: ApiError) {
    super(payload.message || payload.error || 'Request failed');
    this.name = 'BusinessAreaL4ApiError';
    this.status = payload.status;
    this.code = payload.code;
    this.fieldErrors = payload.fieldErrors;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${RESOURCE_PATH}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  });

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const text = await response.text();
  const body = text ? safeParseJson(text) : null;

  if (!response.ok) {
    if (body && typeof body === 'object' && 'status' in body) {
      throw new BusinessAreaL4ApiError(body as ApiError);
    }
    throw new BusinessAreaL4ApiError({
      timestamp: new Date().toISOString(),
      status: response.status,
      error: response.statusText,
      message: response.statusText || 'Request failed',
      path: RESOURCE_PATH + path,
    });
  }

  return body as T;
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export interface ListParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

function buildQuery(params: ListParams): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.size !== undefined) search.set('size', String(params.size));
  if (params.sort) search.set('sort', params.sort);
  if (params.search) search.set('search', params.search);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ---------- Mock data layer (active when NEXT_PUBLIC_CO_DEV_ENV=mock) ----------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const seedNow = '2026-04-20T09:00:00Z';
const seedThen = '2026-04-25T14:30:00Z';

let mockStore: BusinessAreaL4Entitlement[] = [
  {
    id: 1,
    businessAreaL4: 'GLOBAL MARKETS - EQUITIES',
    pcOwnerDelegate: 'BR1001',
    pcSupervisor: 'BR1002',
    mrOwnerDelegate: 'BR1003',
    mrSupervisor: 'BR1004',
    wcrOwnerDelegate: 'BR1005',
    wcrSupervisor: 'BR1006',
    ccrOwnerDelegate: 'BR1007',
    ccrSupervisor: 'BR1008',
    irbOwnerDelegate: 'BR1009',
    irbSupervisor: 'BR1010',
    regPolicyOwnerDelegate: 'BR1011',
    regPolicySupervisor: 'BR1012',
    regRepOwnerDelegate: 'BR1013',
    regRepSupervisor: 'BR1014',
    governanceForum: 'BR1015',
    createdBy: 'kumarp15',
    createdOn: seedNow,
    updatedBy: 'kumarp15',
    updatedOn: seedThen,
  },
  {
    id: 2,
    businessAreaL4: 'GLOBAL MARKETS - FIXED INCOME',
    pcOwnerDelegate: 'BR2001',
    pcSupervisor: 'BR2002',
    mrOwnerDelegate: 'BR2003',
    mrSupervisor: 'BR2004',
    wcrOwnerDelegate: null,
    wcrSupervisor: null,
    ccrOwnerDelegate: 'BR2007',
    ccrSupervisor: 'BR2008',
    irbOwnerDelegate: 'BR2009',
    irbSupervisor: 'BR2010',
    regPolicyOwnerDelegate: 'BR2011',
    regPolicySupervisor: null,
    regRepOwnerDelegate: 'BR2013',
    regRepSupervisor: 'BR2014',
    governanceForum: 'BR2015',
    createdBy: 'smithj22',
    createdOn: '2026-04-15T10:00:00Z',
    updatedBy: 'smithj22',
    updatedOn: '2026-04-26T11:15:00Z',
  },
  {
    id: 3,
    businessAreaL4: 'INVESTMENT BANKING - M&A',
    pcOwnerDelegate: 'BR3001',
    pcSupervisor: 'BR3002',
    mrOwnerDelegate: null,
    mrSupervisor: null,
    wcrOwnerDelegate: 'BR3005',
    wcrSupervisor: 'BR3006',
    ccrOwnerDelegate: null,
    ccrSupervisor: null,
    irbOwnerDelegate: 'BR3009',
    irbSupervisor: 'BR3010',
    regPolicyOwnerDelegate: 'BR3011',
    regPolicySupervisor: 'BR3012',
    regRepOwnerDelegate: null,
    regRepSupervisor: null,
    governanceForum: 'BR3015',
    createdBy: 'analyst01',
    createdOn: '2026-04-10T08:30:00Z',
    updatedBy: 'analyst01',
    updatedOn: '2026-04-22T16:45:00Z',
  },
  {
    id: 4,
    businessAreaL4: 'WEALTH MANAGEMENT - PRIVATE BANK',
    pcOwnerDelegate: 'BR4001',
    pcSupervisor: 'BR4002',
    mrOwnerDelegate: 'BR4003',
    mrSupervisor: 'BR4004',
    wcrOwnerDelegate: 'BR4005',
    wcrSupervisor: 'BR4006',
    ccrOwnerDelegate: 'BR4007',
    ccrSupervisor: 'BR4008',
    irbOwnerDelegate: null,
    irbSupervisor: null,
    regPolicyOwnerDelegate: 'BR4011',
    regPolicySupervisor: 'BR4012',
    regRepOwnerDelegate: 'BR4013',
    regRepSupervisor: 'BR4014',
    governanceForum: 'BR4015',
    createdBy: 'hrmanager01',
    createdOn: '2026-04-05T12:00:00Z',
    updatedBy: 'kumarp15',
    updatedOn: '2026-04-27T09:00:00Z',
  },
  {
    id: 5,
    businessAreaL4: 'CORPORATE BANKING - CASH MANAGEMENT',
    pcOwnerDelegate: 'BR5001',
    pcSupervisor: 'BR5002',
    mrOwnerDelegate: 'BR5003',
    mrSupervisor: 'BR5004',
    wcrOwnerDelegate: 'BR5005',
    wcrSupervisor: 'BR5006',
    ccrOwnerDelegate: 'BR5007',
    ccrSupervisor: 'BR5008',
    irbOwnerDelegate: 'BR5009',
    irbSupervisor: 'BR5010',
    regPolicyOwnerDelegate: null,
    regPolicySupervisor: null,
    regRepOwnerDelegate: 'BR5013',
    regRepSupervisor: 'BR5014',
    governanceForum: 'BR5015',
    createdBy: 'systemadmin',
    createdOn: '2026-04-01T07:30:00Z',
    updatedBy: 'systemadmin',
    updatedOn: '2026-04-28T13:00:00Z',
  },
  {
    id: 6,
    businessAreaL4: 'TRANSACTION BANKING - TRADE FINANCE',
    pcOwnerDelegate: 'BR6001',
    pcSupervisor: 'BR6002',
    mrOwnerDelegate: null,
    mrSupervisor: 'BR6004',
    wcrOwnerDelegate: 'BR6005',
    wcrSupervisor: 'BR6006',
    ccrOwnerDelegate: 'BR6007',
    ccrSupervisor: null,
    irbOwnerDelegate: 'BR6009',
    irbSupervisor: 'BR6010',
    regPolicyOwnerDelegate: 'BR6011',
    regPolicySupervisor: 'BR6012',
    regRepOwnerDelegate: 'BR6013',
    regRepSupervisor: 'BR6014',
    governanceForum: 'BR6015',
    createdBy: 'slamanager',
    createdOn: '2026-03-28T15:00:00Z',
    updatedBy: 'slamanager',
    updatedOn: '2026-04-24T10:30:00Z',
  },
];

const mockHistoryStore: Record<number, BusinessAreaL4EntitlementHistory[]> = {
  1: [
    {
      revisionNumber: 1,
      revisionTimestamp: seedNow,
      revisionType: 'ADD',
      snapshot: { ...mockStore[0], pcOwnerDelegate: 'BR1000', updatedBy: 'kumarp15', updatedOn: seedNow },
    },
    {
      revisionNumber: 2,
      revisionTimestamp: seedThen,
      revisionType: 'MOD',
      snapshot: mockStore[0],
    },
  ],
  2: [
    {
      revisionNumber: 1,
      revisionTimestamp: '2026-04-15T10:00:00Z',
      revisionType: 'ADD',
      snapshot: mockStore[1],
    },
  ],
};

let mockIdCounter = mockStore.length + 1;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function applySearch(
  rows: BusinessAreaL4Entitlement[],
  search?: string,
): BusinessAreaL4Entitlement[] {
  if (!search) return rows;
  const q = search.toLowerCase();
  return rows.filter(
    (r) =>
      r.businessAreaL4.toLowerCase().includes(q) ||
      (r.governanceForum ?? '').toLowerCase().includes(q),
  );
}

function applySort(
  rows: BusinessAreaL4Entitlement[],
  sort?: string,
): BusinessAreaL4Entitlement[] {
  if (!sort) return rows;
  const [field, dir] = sort.split(',');
  const ascending = dir !== 'desc';
  const key = field as keyof BusinessAreaL4Entitlement;
  return [...rows].sort((a, b) => {
    const av = a[key] ?? '';
    const bv = b[key] ?? '';
    if (av < bv) return ascending ? -1 : 1;
    if (av > bv) return ascending ? 1 : -1;
    return 0;
  });
}

async function mockList(
  params: ListParams,
): Promise<PageResponse<BusinessAreaL4Entitlement>> {
  await delay(200);
  const size = params.size ?? 10;
  const page = params.page ?? 0;
  const filtered = applySort(applySearch(mockStore, params.search), params.sort);
  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = page * size;
  const content = deepClone(filtered.slice(start, start + size));
  return {
    content,
    totalElements,
    totalPages,
    number: page,
    size,
  };
}

async function mockGet(id: number): Promise<BusinessAreaL4Entitlement> {
  await delay(150);
  const row = mockStore.find((r) => r.id === id);
  if (!row) {
    throw new BusinessAreaL4ApiError({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'Not Found',
      message: 'Entitlement not found',
      path: `${RESOURCE_PATH}/${id}`,
    });
  }
  return deepClone(row);
}

async function mockCreate(
  payload: BusinessAreaL4EntitlementRequest,
): Promise<BusinessAreaL4Entitlement> {
  await delay(200);
  const upper = payload.businessAreaL4.trim().toUpperCase();
  if (mockStore.some((r) => r.businessAreaL4 === upper)) {
    throw new BusinessAreaL4ApiError({
      timestamp: new Date().toISOString(),
      status: 409,
      error: 'Conflict',
      code: 'DUPLICATE_BUSINESS_AREA_L4',
      message: 'Business Area L4 already exists',
      path: RESOURCE_PATH,
    });
  }
  const now = new Date().toISOString();
  const created: BusinessAreaL4Entitlement = {
    ...(payload as Omit<BusinessAreaL4Entitlement, 'id' | 'createdBy' | 'createdOn' | 'updatedBy' | 'updatedOn'>),
    businessAreaL4: upper,
    id: mockIdCounter++,
    createdBy: 'mockuser',
    createdOn: now,
    updatedBy: 'mockuser',
    updatedOn: now,
  };
  mockStore = [...mockStore, created];
  mockHistoryStore[created.id] = [
    {
      revisionNumber: 1,
      revisionTimestamp: now,
      revisionType: 'ADD',
      snapshot: deepClone(created),
    },
  ];
  return deepClone(created);
}

async function mockUpdate(
  id: number,
  payload: BusinessAreaL4EntitlementRequest,
): Promise<BusinessAreaL4Entitlement> {
  await delay(200);
  const idx = mockStore.findIndex((r) => r.id === id);
  if (idx === -1) {
    throw new BusinessAreaL4ApiError({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'Not Found',
      message: 'Entitlement not found',
      path: `${RESOURCE_PATH}/${id}`,
    });
  }
  const upper = payload.businessAreaL4.trim().toUpperCase();
  if (mockStore.some((r) => r.id !== id && r.businessAreaL4 === upper)) {
    throw new BusinessAreaL4ApiError({
      timestamp: new Date().toISOString(),
      status: 409,
      error: 'Conflict',
      code: 'DUPLICATE_BUSINESS_AREA_L4',
      message: 'Business Area L4 already exists',
      path: `${RESOURCE_PATH}/${id}`,
    });
  }
  const existing = mockStore[idx];
  const now = new Date().toISOString();
  const updated: BusinessAreaL4Entitlement = {
    ...existing,
    ...(payload as Omit<BusinessAreaL4Entitlement, 'id' | 'createdBy' | 'createdOn' | 'updatedBy' | 'updatedOn'>),
    businessAreaL4: upper,
    id: existing.id,
    createdBy: existing.createdBy,
    createdOn: existing.createdOn,
    updatedBy: 'mockuser',
    updatedOn: now,
  };
  mockStore = [...mockStore.slice(0, idx), updated, ...mockStore.slice(idx + 1)];
  const history = mockHistoryStore[id] || [];
  mockHistoryStore[id] = [
    ...history,
    {
      revisionNumber: history.length + 1,
      revisionTimestamp: now,
      revisionType: 'MOD',
      snapshot: deepClone(updated),
    },
  ];
  return deepClone(updated);
}

async function mockRemove(id: number): Promise<void> {
  await delay(150);
  const existing = mockStore.find((r) => r.id === id);
  if (!existing) return;
  mockStore = mockStore.filter((r) => r.id !== id);
  const history = mockHistoryStore[id] || [];
  mockHistoryStore[id] = [
    ...history,
    {
      revisionNumber: history.length + 1,
      revisionTimestamp: new Date().toISOString(),
      revisionType: 'DEL',
      snapshot: deepClone(existing),
    },
  ];
}

async function mockHistory(
  id: number,
): Promise<BusinessAreaL4EntitlementHistory[]> {
  await delay(200);
  return deepClone(mockHistoryStore[id] || []);
}

// ---------- Public API ----------

export const businessAreaL4Service = {
  list(params: ListParams = {}): Promise<PageResponse<BusinessAreaL4Entitlement>> {
    if (MOCK_MODE) return mockList(params);
    return request<PageResponse<BusinessAreaL4Entitlement>>(buildQuery(params), {
      method: 'GET',
    });
  },

  get(id: number): Promise<BusinessAreaL4Entitlement> {
    if (MOCK_MODE) return mockGet(id);
    return request<BusinessAreaL4Entitlement>(`/${id}`, { method: 'GET' });
  },

  create(payload: BusinessAreaL4EntitlementRequest): Promise<BusinessAreaL4Entitlement> {
    if (MOCK_MODE) return mockCreate(payload);
    return request<BusinessAreaL4Entitlement>('', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(
    id: number,
    payload: BusinessAreaL4EntitlementRequest,
  ): Promise<BusinessAreaL4Entitlement> {
    if (MOCK_MODE) return mockUpdate(id, payload);
    return request<BusinessAreaL4Entitlement>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  remove(id: number): Promise<void> {
    if (MOCK_MODE) return mockRemove(id);
    return request<void>(`/${id}`, { method: 'DELETE' });
  },

  history(id: number): Promise<BusinessAreaL4EntitlementHistory[]> {
    if (MOCK_MODE) return mockHistory(id);
    return request<BusinessAreaL4EntitlementHistory[]>(`/${id}/history`, {
      method: 'GET',
    });
  },
};
