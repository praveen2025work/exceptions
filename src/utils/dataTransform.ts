import { CoreException, Exception, ExceptionData, L04Category } from '@/types/exception';

// Sample users for assignment
const USERS = [
  'John Smith',
  'Sarah Johnson', 
  'Michael Chen',
  'Emily Davis',
  'David Wilson',
  'Lisa Anderson',
  'Robert Taylor',
  'Jennifer Martinez',
  'Praveen Kumar'
];

// Function to generate a unique exception ID
function generateExceptionId(index: number): string {
  const year = new Date().getFullYear();
  return `EXC-${year}-${String(index + 1).padStart(3, '0')}`;
}

// Function to calculate priority based on position values and match status
function calculatePriority(positionAV: number, tetbMatch: boolean): 'Low' | 'Medium' | 'High' | 'Critical' {
  const absValue = Math.abs(positionAV);
  
  if (!tetbMatch && absValue > 10000000) return 'Critical';
  if (!tetbMatch && absValue > 5000000) return 'High';
  if (!tetbMatch && absValue > 1000000) return 'Medium';
  if (!tetbMatch) return 'Medium';
  if (absValue > 10000000) return 'High';
  if (absValue > 1000000) return 'Medium';
  return 'Low';
}

// Function to calculate status based on various factors
function calculateStatus(tetbMatch: boolean, reason: string): 'Open' | 'In Progress' | 'Resolved' | 'Closed' {
  if (tetbMatch && !reason.includes('result=Yes')) return 'Resolved';
  if (reason.includes('result=Yes')) return 'In Progress';
  return 'Open';
}

// Function to calculate SLA status based on aging and priority
function calculateSLAStatus(agingDays: number, priority: string): 'Within SLA' | 'SLA Breach' | 'SLA Warning' {
  const slaThresholds = {
    'Critical': 1,
    'High': 2,
    'Medium': 3,
    'Low': 5
  };
  
  const threshold = slaThresholds[priority as keyof typeof slaThresholds] || 3;
  
  if (agingDays > threshold) return 'SLA Breach';
  if (agingDays === threshold) return 'SLA Warning';
  return 'Within SLA';
}

// Function to calculate aging days from as_of_time
function calculateAgingDays(asOfTime: string): number {
  const asOfDate = new Date(asOfTime);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate.getTime() - asOfDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Function to assign random user
function assignRandomUser(): string {
  return USERS[Math.floor(Math.random() * USERS.length)];
}

// Function to calculate due date based on priority and created date
function calculateDueDate(createdDate: string, priority: string): string {
  const created = new Date(createdDate);
  const dueDays = {
    'Critical': 1,
    'High': 2,
    'Medium': 3,
    'Low': 5
  };
  
  const daysToAdd = dueDays[priority as keyof typeof dueDays] || 3;
  const dueDate = new Date(created);
  dueDate.setDate(dueDate.getDate() + daysToAdd);
  
  return dueDate.toISOString();
}

// Main transformation function
export function transformCoreToFunctional(coreData: CoreException[]): Exception[] {
  return coreData.map((core, index) => {
    // Parse numeric values
    const positionAV = parseFloat(core["Position AV"]);
    const tetbAV = parseFloat(core["TETB AV"]);
    const positionQty = parseFloat(core["Position Qty"]);
    const tetbQty = parseFloat(core["TETB ety"]);
    const tetbMatch = core["TETB Match"].toLowerCase() === 'match';
    
    // Calculate functional fields
    const priority = calculatePriority(positionAV, tetbMatch);
    const status = calculateStatus(tetbMatch, core["Reason"]);
    const agingDays = calculateAgingDays(core["As of time"]);
    const slaStatus = calculateSLAStatus(agingDays, priority);
    const assignedTo = assignRandomUser();
    const createdDate = core["As of time"];
    const dueDate = calculateDueDate(createdDate, priority);
    
    // Transform to functional exception
    const exception: Exception = {
      id: generateExceptionId(index),
      l04_business_area_name: core["IO4 _BUSINESS AREA NAME"],
      l06_name: core["L06 NAME"],
      named_no_name: core["NAMEDNL NAME"],
      ads_book_code: core["SDS Book Code"],
      ads_book_path: core["SDS Book Path"],
      system: core["System"],
      legal_entity: core["Legal Entity"],
      regulator: core["Regulator"],
      instrument_id: core["Instrument Id"],
      equity_class_path: core["Equity Class Type"],
      instrument_type: core["Instrument Type"],
      instrument_name: core["Instrument Name"],
      position_tbbb_classification: core["Position TBBB Classification"],
      as_of_time: core["As of time"],
      bb_underlying: core["BB Underlyings"],
      reason: core["Reason"],
      look_through: core["Look through"],
      sod_dealt_bb_underlying: core["SOD Delta on BB Underlying"],
      position_av: positionAV,
      tetb_av: tetbAV,
      position_qty: positionQty,
      tetb_qty: tetbQty,
      tetb_match: tetbMatch,
      // Calculated functional fields
      status,
      priority,
      sla_status: slaStatus,
      assigned_to: assignedTo,
      created_date: createdDate,
      due_date: dueDate,
      aging_days: agingDays
    };
    
    return exception;
  });
}

// Function to generate L04/L06 categories from exceptions
export function generateCategoriesFromExceptions(exceptions: Exception[]): L04Category[] {
  const l04Map = new Map<string, Map<string, number>>();
  
  exceptions.forEach(exception => {
    const l04Name = exception.l04_business_area_name;
    const l06Name = exception.l06_name;
    
    if (!l04Map.has(l04Name)) {
      l04Map.set(l04Name, new Map());
    }
    
    const l06Map = l04Map.get(l04Name)!;
    l06Map.set(l06Name, (l06Map.get(l06Name) || 0) + 1);
  });
  
  return Array.from(l04Map.entries()).map(([l04Name, l06Map]) => ({
    name: l04Name,
    count: Array.from(l06Map.values()).reduce((sum, count) => sum + count, 0),
    l06_categories: Array.from(l06Map.entries()).map(([l06Name, count]) => ({
      name: l06Name,
      count
    }))
  }));
}

// Main function to load and transform data
export function loadAndTransformData(): ExceptionData {
  // In a real application, this would load from an API or file
  // For now, we'll import the core data directly
  const coreData: CoreException[] = require('@/data/core-exceptions.json');
  
  const exceptions = transformCoreToFunctional(coreData);
  const l04_categories = generateCategoriesFromExceptions(exceptions);
  
  return {
    exceptions,
    l04_categories
  };
}