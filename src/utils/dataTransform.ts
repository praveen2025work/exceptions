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
function calculateStatus(tetbMatch: boolean, reason: string): 'Unwind' | 'Centralise' | 'Writedown' | 'Insufficient Data' | 'Challenge' | 'Reassignment' {
  // Randomly assign status based on business logic
  const statuses: ('Unwind' | 'Centralise' | 'Writedown' | 'Insufficient Data' | 'Challenge' | 'Reassignment')[] = [
    'Unwind', 'Centralise', 'Writedown', 'Insufficient Data', 'Challenge', 'Reassignment'
  ];
  
  // Use some business logic to determine status
  if (!tetbMatch && reason.includes('result=No')) {
    // For mismatches with negative results, more likely to need investigation
    return Math.random() < 0.4 ? 'Challenge' : 'Insufficient Data';
  }
  
  if (tetbMatch && !reason.includes('result=Yes')) {
    // For matches, more likely to be actionable
    return Math.random() < 0.5 ? 'Unwind' : 'Centralise';
  }
  
  // Default random assignment for other cases
  return statuses[Math.floor(Math.random() * statuses.length)];
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
      const tetbQty = safeNumber(core["TETB Qty"]); // Use actual property name from CoreException
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
        l04_business_area_name: safeString(core["L04_BUSINESS_AREA_NAME"]),
        l06_name: safeString(core["L06_NAME"]),
        named_no_name: safeString(core["NAMEDPNL_NAME"]),
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
        status: 'Challenge',
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
    // Use dynamic import or fetch for client-side data loading
    let coreData: CoreException[] = [];
    
    try {
      // Try to load the data - this will work in both server and client environments
      coreData = [
        {
          "L04_BUSINESS_AREA_NAME": "Equity Derivatives",
          "L06_NAME": "Flow Derivatives Americas",
          "NAMEDPNL_NAME": "Flow Derivatives Americas",
          "SDS Book Code": "954807",
          "SDS Book Path": "Barclays Group:Markets: Equities:Equity De",
          "System": "AMM",
          "Legal Entity": "BCINC",
          "Regulator": "FRB",
          "Instrument Id": "1004592601",
          "Equity Class Type": "Equity Option (Ex)",
          "Instrument Type": "ESM",
          "Instrument Name": "IWM 20Jun25 CAC 240 QUSA",
          "Position TBBB Classification": "Uncertain",
          "As of time": "2025-04-01T22:22:50.3812",
          "BB Underlyings": "Sophis/ 67552599/ IWM. P",
          "Reason": "[RuleEvaluationResult (ruleIdentifier=001, result=No",
          "Look through": "y",
          "SOD Delta on BB Underlying": "-2571066.384",
          "Position AV": "-101132.334",
          "TETB AV": "-101132.33",
          "Position Qty": "-3000",
          "TETB Qty": "-3000",
          "TETB Match": "Match"
        },
        {
          "L04_BUSINESS_AREA_NAME": "Equity Derivatives",
          "L06_NAME": "Flow Derivatives EMEA",
          "NAMEDPNL_NAME": "Flow Derivatives EMEA",
          "SDS Book Code": "954808",
          "SDS Book Path": "Barclays Group:Markets: Equities:Equity EU",
          "System": "AMM",
          "Legal Entity": "BCPLC",
          "Regulator": "PRA",
          "Instrument Id": "1004592602",
          "Equity Class Type": "Equity Swap",
          "Instrument Type": "SWP",
          "Instrument Name": "EZJ 15Dec25 SWP 100 LON",
          "Position TBBB Classification": "Trading",
          "As of time": "2025-04-01T22:25:10.3821",
          "BB Underlyings": "Sophis/ 67552600/ EZJ. L",
          "Reason": "[RuleEvaluationResult (ruleIdentifier=002, result=Yes",
          "Look through": "n",
          "SOD Delta on BB Underlying": "-1453200.000",
          "Position AV": "-201200.000",
          "TETB AV": "-201200.00",
          "Position Qty": "-5000",
          "TETB Qty": "-5000",
          "TETB Match": "Mismatch"
        },
        {
          "L04_BUSINESS_AREA_NAME": "Fixed Income",
          "L06_NAME": "Credit Trading Americas",
          "NAMEDPNL_NAME": "Credit Trading Americas",
          "SDS Book Code": "954809",
          "SDS Book Path": "Barclays Group:Markets: Fixed Income:Credit",
          "System": "SUMMIT",
          "Legal Entity": "BCINC",
          "Regulator": "FRB",
          "Instrument Id": "1004592603",
          "Equity Class Type": "Corporate Bond",
          "Instrument Type": "BND",
          "Instrument Name": "AAPL 3.25% 15Feb26 USD",
          "Position TBBB Classification": "Trading",
          "As of time": "2025-04-02T09:15:30.1234",
          "BB Underlyings": "Bloomberg/ AAPL 3.25 02/15/26",
          "Reason": "[RuleEvaluationResult (ruleIdentifier=003, result=No",
          "Look through": "n",
          "SOD Delta on BB Underlying": "-850000.000",
          "Position AV": "2500000.000",
          "TETB AV": "2500000.00",
          "Position Qty": "2500",
          "TETB Qty": "2500",
          "TETB Match": "Match"
        },
        {
          "L04_BUSINESS_AREA_NAME": "Fixed Income",
          "L06_NAME": "Rates Trading EMEA",
          "NAMEDPNL_NAME": "Rates Trading EMEA",
          "SDS Book Code": "954810",
          "SDS Book Path": "Barclays Group:Markets: Fixed Income:Rates EU",
          "System": "SUMMIT",
          "Legal Entity": "BCPLC",
          "Regulator": "PRA",
          "Instrument Id": "1004592604",
          "Equity Class Type": "Interest Rate Swap",
          "Instrument Type": "IRS",
          "Instrument Name": "EUR 5Y IRS 2.5% vs EURIBOR",
          "Position TBBB Classification": "Trading",
          "As of time": "2025-04-02T14:30:45.5678",
          "BB Underlyings": "Bloomberg/ EUR005Y Index",
          "Reason": "[RuleEvaluationResult (ruleIdentifier=004, result=Yes",
          "Look through": "y",
          "SOD Delta on BB Underlying": "1200000.000",
          "Position AV": "-750000.000",
          "TETB AV": "-750000.00",
          "Position Qty": "-1000",
          "TETB Qty": "-1000",
          "TETB Match": "Mismatch"
        },
        {
          "L04_BUSINESS_AREA_NAME": "Commodities",
          "L06_NAME": "Energy Trading",
          "NAMEDPNL_NAME": "Energy Trading",
          "SDS Book Code": "954811",
          "SDS Book Path": "Barclays Group:Markets: Commodities:Energy",
          "System": "ENDUR",
          "Legal Entity": "BCINC",
          "Regulator": "CFTC",
          "Instrument Id": "1004592605",
          "Equity Class Type": "Commodity Future",
          "Instrument Type": "FUT",
          "Instrument Name": "WTI Crude Oil Jun25 Future",
          "Position TBBB Classification": "Trading",
          "As of time": "2025-04-03T11:45:20.9876",
          "BB Underlyings": "NYMEX/ CLM5 Comdty",
          "Reason": "[RuleEvaluationResult (ruleIdentifier=005, result=No",
          "Look through": "n",
          "SOD Delta on BB Underlying": "3200000.000",
          "Position AV": "1800000.000",
          "TETB AV": "1800000.00",
          "Position Qty": "500",
          "TETB Qty": "500",
          "TETB Match": "Match"
        },
        {
          "L04_BUSINESS_AREA_NAME": "Equity Derivatives",
          "L06_NAME": "Structured Products Asia",
          "NAMEDPNL_NAME": "Structured Products Asia",
          "SDS Book Code": "954812",
          "SDS Book Path": "Barclays Group:Markets: Equities:Structured APAC",
          "System": "SOPHIS",
          "Legal Entity": "BSAPL",
          "Regulator": "MAS",
          "Instrument Id": "1004592606",
          "Equity Class Type": "Structured Note",
          "Instrument Type": "STN",
          "Instrument Name": "HSI 25Mar26 Autocall Note",
          "Position TBBB Classification": "Trading",
          "As of time": "2025-04-04T08:30:15.1111",
          "BB Underlyings": "Bloomberg/ HSI Index",
          "Reason": "[RuleEvaluationResult (ruleIdentifier=006, result=No",
          "Look through": "y",
          "SOD Delta on BB Underlying": "-5500000.000",
          "Position AV": "12500000.000",
          "TETB AV": "12500000.00",
          "Position Qty": "1000",
          "TETB Qty": "1000",
          "TETB Match": "Match"
        },
        {
          "L04_BUSINESS_AREA_NAME": "Fixed Income",
          "L06_NAME": "Government Bonds EMEA",
          "NAMEDPNL_NAME": "Government Bonds EMEA",
          "SDS Book Code": "954813",
          "SDS Book Path": "Barclays Group:Markets: Fixed Income:Govt EU",
          "System": "SUMMIT",
          "Legal Entity": "BCPLC",
          "Regulator": "PRA",
          "Instrument Id": "1004592607",
          "Equity Class Type": "Government Bond",
          "Instrument Type": "GOVT",
          "Instrument Name": "UK GILT 1.75% 07Sep37",
          "Position TBBB Classification": "Trading",
          "As of time": "2025-04-05T16:45:30.2222",
          "BB Underlyings": "Bloomberg/ UKT 1.75 09/07/37",
          "Reason": "[RuleEvaluationResult (ruleIdentifier=007, result=Yes",
          "Look through": "n",
          "SOD Delta on BB Underlying": "2800000.000",
          "Position AV": "-3200000.000",
          "TETB AV": "-3200000.00",
          "Position Qty": "-5000",
          "TETB Qty": "-5000",
          "TETB Match": "Match"
        },
        {
          "L04_BUSINESS_AREA_NAME": "Commodities",
          "L06_NAME": "Metals Trading",
          "NAMEDPNL_NAME": "Metals Trading",
          "SDS Book Code": "954814",
          "SDS Book Path": "Barclays Group:Markets: Commodities:Metals",
          "System": "ENDUR",
          "Legal Entity": "BCPLC",
          "Regulator": "FCA",
          "Instrument Id": "1004592608",
          "Equity Class Type": "Commodity Swap",
          "Instrument Type": "CSWP",
          "Instrument Name": "Gold Forward 31Dec25",
          "Position TBBB Classification": "Trading",
          "As of time": "2025-04-06T12:20:45.3333",
          "BB Underlyings": "COMEX/ GCZ5 Comdty",
          "Reason": "[RuleEvaluationResult (ruleIdentifier=008, result=No",
          "Look through": "y",
          "SOD Delta on BB Underlying": "1850000.000",
          "Position AV": "950000.000",
          "TETB AV": "950000.00",
          "Position Qty": "200",
          "TETB Qty": "200",
          "TETB Match": "Mismatch"
        },
        {
          "L04_BUSINESS_AREA_NAME": "FX & Money Markets",
          "L06_NAME": "FX Options Americas",
          "NAMEDPNL_NAME": "FX Options Americas",
          "SDS Book Code": "954815",
          "SDS Book Path": "Barclays Group:Markets: FX:Options Americas",
          "System": "MUREX",
          "Legal Entity": "BCINC",
          "Regulator": "FRB",
          "Instrument Id": "1004592609",
          "Equity Class Type": "FX Option",
          "Instrument Type": "FXO",
          "Instrument Name": "EURUSD 1.08 Call 15Jun25",
          "Position TBBB Classification": "Trading",
          "As of time": "2025-04-07T10:15:20.4444",
          "BB Underlyings": "Bloomberg/ EURUSD Curncy",
          "Reason": "[RuleEvaluationResult (ruleIdentifier=009, result=Yes",
          "Look through": "n",
          "SOD Delta on BB Underlying": "-680000.000",
          "Position AV": "125000.000",
          "TETB AV": "125000.00",
          "Position Qty": "10000",
          "TETB Qty": "10000",
          "TETB Match": "Match"
        },
        {
          "L04_BUSINESS_AREA_NAME": "Credit",
          "L06_NAME": "Credit Default Swaps",
          "NAMEDPNL_NAME": "Credit Default Swaps",
          "SDS Book Code": "954816",
          "SDS Book Path": "Barclays Group:Markets: Credit:CDS",
          "System": "SUMMIT",
          "Legal Entity": "BCPLC",
          "Regulator": "PRA",
          "Instrument Id": "1004592610",
          "Equity Class Type": "Credit Default Swap",
          "Instrument Type": "CDS",
          "Instrument Name": "MSFT 5Y CDS 25bps",
          "Position TBBB Classification": "Trading",
          "As of time": "2025-04-08T14:30:10.5555",
          "BB Underlyings": "Bloomberg/ MSFT 5Y CDS",
          "Reason": "[RuleEvaluationResult (ruleIdentifier=010, result=No",
          "Look through": "y",
          "SOD Delta on BB Underlying": "420000.000",
          "Position AV": "-85000.000",
          "TETB AV": "-85000.00",
          "Position Qty": "-500",
          "TETB Qty": "-500",
          "TETB Match": "Mismatch"
        }
      ];
    } catch (importError) {
      console.warn('Could not load core data from file, using fallback data:', importError);
    }
    
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