// Core data interface - matches the raw data structure
export interface CoreException {
  "L04_BUSINESS_AREA_NAME": string;
  "L06_NAME": string;
  "NAMEDPNL_NAME": string;
  "SDS Book Code": string;
  "SDS Book Path": string;
  "System": string;
  "Legal Entity": string;
  "Regulator": string;
  "Instrument Id": string;
  "Equity Class Type": string;
  "Instrument Type": string;
  "Instrument Name": string;
  "Position TBBB Classification": string;
  "As of time": string;
  "BB Underlyings": string;
  "Reason": string;
  "Look through": string;
  "SOD Delta on BB Underlying": string;
  "Position AV": string;
  "TETB AV": string;
  "Position Qty": string;
  "TETB Qty": string;
  "TETB Match": string;
}

// Functional data interface - includes calculated fields
export interface Exception {
  id: string;
  l04_business_area_name: string;
  l06_name: string;
  named_no_name: string;
  ads_book_code: string;
  ads_book_path: string;
  system: string;
  legal_entity: string;
  regulator: string;
  instrument_id: string;
  equity_class_path: string;
  instrument_type: string;
  instrument_name: string;
  position_tbbb_classification: string;
  as_of_time: string;
  bb_underlying: string;
  reason: string;
  look_through: string;
  sod_dealt_bb_underlying: string;
  position_av: number;
  tetb_av: number;
  position_qty: number;
  tetb_qty: number;
  tetb_match: boolean;
  // Calculated functional fields
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  sla_status: 'Within SLA' | 'SLA Breach' | 'SLA Warning';
  assigned_to: string;
  created_date: string;
  due_date: string;
  aging_days: number;
}

export interface L06Category {
  name: string;
  count: number;
}

export interface L04Category {
  name: string;
  count: number;
  l06_categories: L06Category[];
}

export interface ExceptionData {
  exceptions: Exception[];
  l04_categories: L04Category[];
}

export interface ExceptionFilters {
  ads_book_code: string;
  system: string;
  legal_entity: string;
  regulator: string;
  status: string;
  l04_business_area_name: string;
  l06_name: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignee?: string;
  completedAt?: string;
  comments?: string;
}

export interface ExceptionWorkflow {
  exceptionId: string;
  currentStep: number;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}