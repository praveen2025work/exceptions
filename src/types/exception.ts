export interface PositionException {
  "SDS Book Code": string;
  System: string;
  "Legal Entity": string;
  Regulator: string;
  "Instrument Id": string;
  "Equity Class Type": string;
  "Instrument Type": string;
  "Instrument Name": string;
  "Position TBBB Classification": string;
  "As of time": string;
  "BB Underlying": string;
  "SOD Delta on BB Underlying": string;
  "Position AV": string;
  "Position Qty": string;
  "Look through": string;
  "SDS Book Path": string;
  Reason: string;
}

export interface Exception {
  id: string;
  instrumentId: string;
  bookCode: string;
  classification: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdDate: string;
  lastModified: string;
  daysOpen: number;
  slaStatus: "Within SLA" | "At Risk" | "Breached";
  assignedTo?: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  workflowId?: string;
  // Level hierarchy
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
  level5?: string;
  level6: string; // NEW - Required field
  // Additional fields from position data
  system?: string;
  legalEntity?: string;
  regulator?: string;
  equityClassType?: string;
  instrumentType?: string;
  instrumentName?: string;
  positionClassification?: string;
  asOfTime?: string;
  bbUnderlying?: string;
  sodDelta?: string;
  positionAV?: string;
  positionQty?: string;
  lookThrough?: string;
  sdsBookPath?: string;
  reason?: string;
}

export type WorkflowType = "REASSIGNMENT" | "ESCALATION" | "APPROVAL";
export type WorkflowStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type StepStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Analyst" | "Viewer";
  department?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  assignee: User;
  status: StepStatus;
  dueDate: string;
  completedDate?: string;
  comments: string;
}

export interface Workflow {
  id: string;
  exceptionId: string;
  type: WorkflowType;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdDate: string;
  completedDate?: string;
}

export interface Level6Group {
  level6: string;
  count: number;
  exceptions: Exception[];
  workflows: Workflow[];
}

// Sample data for generating realistic exceptions
const LEVEL_HIERARCHIES = {
  level1: ["Trading", "Risk Management", "Operations", "Compliance"],
  level2: ["Equity Trading", "Fixed Income", "Derivatives", "Credit Risk", "Market Risk", "Settlement", "Clearing", "Regulatory Reporting"],
  level3: ["US Equities", "EU Equities", "APAC Equities", "Corporate Bonds", "Government Bonds", "Interest Rate Swaps", "Credit Default Swaps"],
  level4: ["NYSE", "NASDAQ", "LSE", "TSE", "HKEX", "US Treasury", "UK Gilts", "German Bunds"],
  level5: ["Large Cap", "Mid Cap", "Small Cap", "Blue Chip", "Growth", "Value", "Dividend"],
  level6: ["Technology", "Healthcare", "Financial Services", "Energy", "Consumer Goods", "Industrials", "Utilities", "Real Estate", "Materials", "Telecommunications"]
};

const EXCEPTION_TYPES = [
  "Position Mismatch", "Trade Settlement Failure", "Regulatory Breach", "Data Quality Issue",
  "SLA Violation", "System Error", "Manual Override Required", "Compliance Check Failed",
  "Risk Limit Exceeded", "Reconciliation Break"
];

const USERS: User[] = [
  { id: "u1", name: "John Smith", email: "john.smith@company.com", role: "Manager", department: "Trading" },
  { id: "u2", name: "Sarah Johnson", email: "sarah.johnson@company.com", role: "Analyst", department: "Risk" },
  { id: "u3", name: "Mike Chen", email: "mike.chen@company.com", role: "Admin", department: "Operations" },
  { id: "u4", name: "Emily Davis", email: "emily.davis@company.com", role: "Analyst", department: "Compliance" },
  { id: "u5", name: "Robert Wilson", email: "robert.wilson@company.com", role: "Manager", department: "Settlement" },
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomDate(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
}

export function generateSampleExceptions(count: number = 10000): Exception[] {
  const exceptions: Exception[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = `EXC-${String(i + 1).padStart(6, '0')}`;
    const createdDate = generateRandomDate(90); // Up to 90 days back
    const createdDateObj = new Date(createdDate);
    const daysOpen = Math.floor((new Date().getTime() - createdDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determine status and priority based on days open
    let status: "Open" | "In Progress" | "Resolved" | "Closed" = "Open";
    let priority: "Low" | "Medium" | "High" | "Critical" = "Medium";
    let slaStatus: "Within SLA" | "At Risk" | "Breached" = "Within SLA";
    
    if (daysOpen > 30) {
      status = Math.random() > 0.3 ? "Resolved" : "Closed";
      priority = "Low";
    } else if (daysOpen > 14) {
      status = Math.random() > 0.4 ? "In Progress" : "Open";
      priority = "High";
      slaStatus = "Breached";
    } else if (daysOpen > 7) {
      status = Math.random() > 0.6 ? "In Progress" : "Open";
      priority = "Medium";
      slaStatus = "At Risk";
    } else {
      priority = Math.random() > 0.8 ? "Critical" : "Medium";
    }
    
    const level1 = getRandomElement(LEVEL_HIERARCHIES.level1);
    const level2 = getRandomElement(LEVEL_HIERARCHIES.level2);
    const level3 = getRandomElement(LEVEL_HIERARCHIES.level3);
    const level4 = getRandomElement(LEVEL_HIERARCHIES.level4);
    const level5 = getRandomElement(LEVEL_HIERARCHIES.level5);
    const level6 = getRandomElement(LEVEL_HIERARCHIES.level6);
    
    const systems = ["COMPASS", "AMM", "Atlas", "Bloomberg", "Reuters"];
    const legalEntities = ["BCINC", "BBPLC", "BCNY", "BCLND"];
    const regulators = ["FRB", "PRA", "SEC", "FCA", "CFTC"];
    
    exceptions.push({
      id,
      instrumentId: `INS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      bookCode: `BK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      classification: getRandomElement(EXCEPTION_TYPES),
      status,
      createdDate,
      lastModified: new Date().toISOString(),
      daysOpen,
      slaStatus,
      assignedTo: getRandomElement(USERS).name,
      priority,
      workflowId: Math.random() > 0.7 ? `WF-${Math.random().toString(36).substring(2, 8)}` : undefined,
      level1,
      level2,
      level3,
      level4,
      level5,
      level6,
      system: getRandomElement(systems),
      legalEntity: getRandomElement(legalEntities),
      regulator: getRandomElement(regulators),
      equityClassType: getRandomElement(["Common Stock", "Preferred Stock", "ETF", "REIT"]),
      instrumentType: getRandomElement(["Equity", "Bond", "Derivative", "Fund"]),
      instrumentName: `${level6} ${getRandomElement(["Corp", "Inc", "Ltd", "Group"])}`,
      positionClassification: getRandomElement(["Trading Book", "Banking Book", "Available for Sale"]),
      asOfTime: createdDate,
      bbUnderlying: `${Math.random().toString(36).substring(2, 4).toUpperCase()} Equity`,
      sodDelta: (Math.random() * 1000000 - 500000).toFixed(2),
      positionAV: (Math.random() * 10000000).toFixed(2),
      positionQty: Math.floor(Math.random() * 100000).toString(),
      lookThrough: Math.random() > 0.5 ? "Yes" : "No",
      sdsBookPath: `/${level1}/${level2}/${level3}`,
      reason: getRandomElement([
        "Position reconciliation break",
        "Trade settlement delay",
        "Data quality issue",
        "System processing error",
        "Manual intervention required"
      ])
    });
  }
  
  return exceptions;
}

export function createWorkflow(exceptionId: string, type: WorkflowType = "REASSIGNMENT"): Workflow {
  const workflowId = `WF-${Math.random().toString(36).substring(2, 8)}`;
  
  const workflowSteps: WorkflowStep[] = [
    {
      id: `${workflowId}-1`,
      name: "FO Owner Action",
      order: 1,
      assignee: getRandomElement(USERS),
      status: "PENDING",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
      comments: "First Owner takes initial action"
    },
    {
      id: `${workflowId}-2`,
      name: "OE Request Reassignment",
      order: 2,
      assignee: getRandomElement(USERS),
      status: "PENDING",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days
      comments: "Operations Excellence requests reassignment"
    },
    {
      id: `${workflowId}-3`,
      name: "PC Rep Approval",
      order: 3,
      assignee: getRandomElement(USERS),
      status: "PENDING",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days
      comments: "Product Category Representative approval"
    },
    {
      id: `${workflowId}-4`,
      name: "RES Approval",
      order: 4,
      assignee: getRandomElement(USERS),
      status: "PENDING",
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days
      comments: "Resolution team approval"
    },
    {
      id: `${workflowId}-5`,
      name: "RI Mar Approval",
      order: 5,
      assignee: getRandomElement(USERS),
      status: "PENDING",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
      comments: "Risk Management approval"
    },
    {
      id: `${workflowId}-6`,
      name: "REG Report",
      order: 6,
      assignee: getRandomElement(USERS),
      status: "PENDING",
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days
      comments: "Regulatory reporting completion"
    }
  ];
  
  return {
    id: workflowId,
    exceptionId,
    type,
    status: "PENDING",
    steps: workflowSteps,
    createdDate: new Date().toISOString()
  };
}

export function groupExceptionsByLevel6(exceptions: Exception[]): Level6Group[] {
  const groups = new Map<string, Level6Group>();
  
  exceptions.forEach(exception => {
    const level6 = exception.level6;
    if (!groups.has(level6)) {
      groups.set(level6, {
        level6,
        count: 0,
        exceptions: [],
        workflows: []
      });
    }
    
    const group = groups.get(level6)!;
    group.count++;
    group.exceptions.push(exception);
  });
  
  return Array.from(groups.values()).sort((a, b) => b.count - a.count);
}

export function mapPositionToException(position: PositionException): Exception {
  // Generate a random ID for the exception
  const id = Math.random().toString(36).substring(2, 11);

  // Determine status based on Position TBBB Classification
  let status: "Open" | "In Progress" | "Resolved" | "Closed" = "Open";
  let priority: "Low" | "Medium" | "High" | "Critical" = "Medium";
  let slaStatus: "Within SLA" | "At Risk" | "Breached" = "Within SLA";

  if (position["Position TBBB Classification"] === "Uncertain") {
    status = "Open";
    priority = "High";
    slaStatus = "At Risk";
  } else if (
    position["Position TBBB Classification"] === "CentraliseAndWritedown"
  ) {
    status = "In Progress";
    priority = "Medium";
  }

  // Calculate days open based on "As of time"
  const asOfDate = new Date(position["As of time"]);
  const currentDate = new Date();
  const daysOpen = Math.floor((currentDate.getTime() - asOfDate.getTime()) / (1000 * 60 * 60 * 24));

  // Adjust SLA status based on days open
  if (daysOpen > 10) {
    slaStatus = "Breached";
    priority = "Critical";
  } else if (daysOpen > 7) {
    slaStatus = "At Risk";
    priority = "High";
  }

  // Generate level hierarchy
  const level1 = getRandomElement(LEVEL_HIERARCHIES.level1);
  const level2 = getRandomElement(LEVEL_HIERARCHIES.level2);
  const level3 = getRandomElement(LEVEL_HIERARCHIES.level3);
  const level4 = getRandomElement(LEVEL_HIERARCHIES.level4);
  const level5 = getRandomElement(LEVEL_HIERARCHIES.level5);
  const level6 = getRandomElement(LEVEL_HIERARCHIES.level6);

  // Create the exception object
  return {
    id,
    instrumentId: position["Instrument Id"],
    bookCode: position["SDS Book Code"],
    classification: position["Position TBBB Classification"],
    status,
    createdDate: position["As of time"],
    lastModified: new Date().toISOString(),
    daysOpen,
    slaStatus,
    priority,
    level1,
    level2,
    level3,
    level4,
    level5,
    level6,
    // Additional fields
    system: position["System"],
    legalEntity: position["Legal Entity"],
    regulator: position["Regulator"],
    equityClassType: position["Equity Class Type"],
    instrumentType: position["Instrument Type"],
    instrumentName: position["Instrument Name"],
    positionClassification: position["Position TBBB Classification"],
    asOfTime: position["As of time"],
    bbUnderlying: position["BB Underlying"],
    sodDelta: position["SOD Delta on BB Underlying"],
    positionAV: position["Position AV"],
    positionQty: position["Position Qty"],
    lookThrough: position["Look through"],
    sdsBookPath: position["SDS Book Path"],
    reason: position["Reason"],
  };
}