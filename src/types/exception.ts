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

  // Calculate days open (random for demo purposes)
  const daysOpen = Math.floor(Math.random() * 14) + 1;

  // If days open > 10, mark as breached
  if (daysOpen > 10) {
    slaStatus = "Breached";
    priority = "Critical";
  } else if (daysOpen > 7) {
    slaStatus = "At Risk";
    priority = "High";
  }

  // Create the exception object
  return {
    id,
    instrumentId: position["Instrument Id"],
    bookCode: position["SDS Book Code"],
    classification: position["Position TBBB Classification"],
    status,
    createdDate: new Date(position["As of time"]).toISOString(),
    lastModified: new Date().toISOString(),
    daysOpen,
    slaStatus,
    priority,
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
