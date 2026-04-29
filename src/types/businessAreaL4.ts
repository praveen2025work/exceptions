export interface BusinessAreaL4Entitlement {
  id: number;
  businessAreaL4: string;
  pcOwnerDelegate: string | null;
  pcSupervisor: string | null;
  mrOwnerDelegate: string | null;
  mrSupervisor: string | null;
  wcrOwnerDelegate: string | null;
  wcrSupervisor: string | null;
  ccrOwnerDelegate: string | null;
  ccrSupervisor: string | null;
  irbOwnerDelegate: string | null;
  irbSupervisor: string | null;
  regPolicyOwnerDelegate: string | null;
  regPolicySupervisor: string | null;
  regRepOwnerDelegate: string | null;
  regRepSupervisor: string | null;
  governanceForum: string | null;
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
}

export type BusinessAreaL4EntitlementRequest = Omit<
  BusinessAreaL4Entitlement,
  'id' | 'createdBy' | 'createdOn' | 'updatedBy' | 'updatedOn'
>;

export type RevisionType = 'ADD' | 'MOD' | 'DEL';

export interface BusinessAreaL4EntitlementHistory {
  revisionNumber: number;
  revisionTimestamp: string;
  revisionType: RevisionType;
  snapshot: BusinessAreaL4Entitlement;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  code?: string;
  message: string;
  path: string;
  fieldErrors?: ApiFieldError[];
}

export type DisciplineKey =
  | 'pc'
  | 'mr'
  | 'wcr'
  | 'ccr'
  | 'irb'
  | 'regPolicy'
  | 'regRep';

export interface DisciplineDef {
  key: DisciplineKey;
  label: string;
  ownerDelegateField: keyof BusinessAreaL4Entitlement;
  supervisorField: keyof BusinessAreaL4Entitlement;
}

export const DISCIPLINES: DisciplineDef[] = [
  { key: 'pc', label: 'PC', ownerDelegateField: 'pcOwnerDelegate', supervisorField: 'pcSupervisor' },
  { key: 'mr', label: 'MR', ownerDelegateField: 'mrOwnerDelegate', supervisorField: 'mrSupervisor' },
  { key: 'wcr', label: 'WCR', ownerDelegateField: 'wcrOwnerDelegate', supervisorField: 'wcrSupervisor' },
  { key: 'ccr', label: 'CCR', ownerDelegateField: 'ccrOwnerDelegate', supervisorField: 'ccrSupervisor' },
  { key: 'irb', label: 'IRB', ownerDelegateField: 'irbOwnerDelegate', supervisorField: 'irbSupervisor' },
  { key: 'regPolicy', label: 'Reg Policy', ownerDelegateField: 'regPolicyOwnerDelegate', supervisorField: 'regPolicySupervisor' },
  { key: 'regRep', label: 'Reg Rep', ownerDelegateField: 'regRepOwnerDelegate', supervisorField: 'regRepSupervisor' },
];

export const BRID_FIELDS: (keyof BusinessAreaL4EntitlementRequest)[] = [
  'pcOwnerDelegate',
  'pcSupervisor',
  'mrOwnerDelegate',
  'mrSupervisor',
  'wcrOwnerDelegate',
  'wcrSupervisor',
  'ccrOwnerDelegate',
  'ccrSupervisor',
  'irbOwnerDelegate',
  'irbSupervisor',
  'regPolicyOwnerDelegate',
  'regPolicySupervisor',
  'regRepOwnerDelegate',
  'regRepSupervisor',
];
