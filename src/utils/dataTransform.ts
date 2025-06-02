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

// Helper function to safely get string value
function safeString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}

// Helper function to safely parse number
function safeNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? defaultValue : parsed;
}

// Helper function to safely parse boolean from string
function safeBoolean(value: any, matchValue: string = 'match'): boolean {
  if (value === null || value === undefined) return false;
  return String(value).toLowerCase() === matchValue.toLowerCase();
}

// Main transformation function
export function transformCoreToFunctional(coreData: CoreException[]): Exception[] {
  return coreData.map((core, index) => {
    try {
      // Parse numeric values safely
      const positionAV = safeNumber(core["Position AV"]);
      const tetbAV = safeNumber(core["TETB AV"]);
      const positionQty = safeNumber(core["Position Qty"]);
      const tetbQty = safeNumber(core["TETB ety"]); // Use actual property name from CoreException
      const tetbMatch = safeBoolean(core["TETB Match"], 'match');
      
      // Calculate functional fields
      const priority = calculatePriority(positionAV, tetbMatch);
      const status = calculateStatus(tetbMatch, safeString(core["Reason"]));
      const agingDays = calculateAgingDays(safeString(core["As of time"], new Date().toISOString()));
      const slaStatus = calculateSLAStatus(agingDays, priority);
      const assignedTo = assignRandomUser();
      const createdDate = safeString(core["As of time"], new Date().toISOString());
      const dueDate = calculateDueDate(createdDate, priority);
      
      // Transform to functional exception using only valid CoreException properties
      const exception: Exception = {
        id: generateExceptionId(index),
        l04_business_area_name: safeString(core["IO4 _BUSINESS AREA NAME"]),
        l06_name: safeString(core["L06 NAME"]),
        named_no_name: safeString(core["NAMEDNL NAME"]),
        ads_book_code: safeString(core["SDS Book Code"]),
        ads_book_path: safeString(core["SDS Book Path"]),
        system: safeString(core["System"]),
        legal_entity: safeString(core["Legal Entity"]),
        regulator: safeString(core["Regulator"]),
        instrument_id: safeString(core["Instrument Id"]),
        equity_class_path: safeString(core["Equity Class Type"]),
        instrument_type: safeString(core["Instrument Type"]),
        instrument_name: safeString(core["Instrument Name"]),
        position_tbbb_classification: safeString(core["Position TBBB Classification"]),
        as_of_time: safeString(core["As of time"], new Date().toISOString()),
        bb_underlying: safeString(core["BB Underlyings"]),
        reason: safeString(core["Reason"]),
        look_through: safeString(core["Look through"]),
        sod_dealt_bb_underlying: safeString(core["SOD Delta on BB Underlying"]),
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
    } catch (error) {
      console.error(`Error transforming exception at index ${index}:`, error, core);
      // Return a default exception in case of error
      return {
        id: generateExceptionId(index),
        l04_business_area_name: 'Unknown',
        l06_name: 'Unknown',
        named_no_name: 'Unknown',
        ads_book_code: 'Unknown',
        ads_book_path: 'Unknown',
        system: 'Unknown',
        legal_entity: 'Unknown',
        regulator: 'Unknown',
        instrument_id: 'Unknown',
        equity_class_path: 'Unknown',
        instrument_type: 'Unknown',
        instrument_name: 'Unknown',
        position_tbbb_classification: 'Unknown',
        as_of_time: new Date().toISOString(),
        bb_underlying: 'Unknown',
        reason: 'Data transformation error',
        look_through: 'Unknown',
        sod_dealt_bb_underlying: 'Unknown',
        position_av: 0,
        tetb_av: 0,
        position_qty: 0,
        tetb_qty: 0,
        tetb_match: false,
        status: 'Open',
        priority: 'Low',
        sla_status: 'Within SLA',
        assigned_to: 'Unassigned',
        created_date: new Date().toISOString(),
        due_date: new Date().toISOString(),
        aging_days: 0
      };
    }
  });
}

// Function to generate L04/L06 categories from exceptions
export function generateCategoriesFromExceptions(exceptions: Exception[]): L04Category[] {
  const l04Map = new Map<string, Map<string, number>>();
  
  exceptions.forEach(exception => {
    // Safely get names with fallbacks
    const l04Name = safeString(exception.l04_business_area_name, 'Unknown L04');
    const l06Name = safeString(exception.l06_name, 'Unknown L06');
    
    // Skip if both are unknown/empty
    if (l04Name === 'Unknown L04' && l06Name === 'Unknown L06') {
      return;
    }
    
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
  try {
    // In a real application, this would load from an API or file
    // For now, we'll import the core data directly
    const coreData: CoreException[] = require('@/data/core-exceptions.json');
    
    // Validate that we have data
    if (!Array.isArray(coreData) || coreData.length === 0) {
      console.warn('No core data found, returning empty data structure');
      return {
        exceptions: [],
        l04_categories: []
      };
    }
    
    console.log(`Loading ${coreData.length} core exceptions for transformation`);
    
    const exceptions = transformCoreToFunctional(coreData);
    const l04_categories = generateCategoriesFromExceptions(exceptions);
    
    console.log(`Transformed to ${exceptions.length} exceptions with ${l04_categories.length} L04 categories`);
    
    return {
      exceptions,
      l04_categories
    };
  } catch (error) {
    console.error('Error loading and transforming data:', error);
    // Return empty data structure on error
    return {
      exceptions: [],
      l04_categories: []
    };
  }
}