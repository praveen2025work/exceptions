import { ApiException, Exception } from "@/types/exception";

// Helper function to determine priority based on aging
const getPriority = (agingDays: number): 'Low' | 'Medium' | 'High' | 'Critical' => {
  if (agingDays > 30) return 'Critical';
  if (agingDays > 14) return 'High';
  if (agingDays > 7) return 'Medium';
  return 'Low';
};

// Helper function to determine SLA status based on aging
const getSlaStatus = (agingDays: number): 'Within SLA' | 'SLA Breach' | 'SLA Warning' => {
  if (agingDays > 14) return 'SLA Breach';
  if (agingDays > 7) return 'SLA Warning';
  return 'Within SLA';
};

// Helper function to parse L04 and L06 from the book path
const parseBookPath = (bookPath: string): { l04: string, l06: string } => {
    const parts = bookPath.split(':');
    // This is an assumption based on the example path. Adjust if the structure varies.
    const l04 = parts.length > 3 ? parts[3] : 'N/A';
    const l06 = parts.length > 6 ? parts[6] : 'N/A';
    return { l04, l06 };
}

// Transforms the raw API data into the format the UI components expect
export const transformApiExceptions = (apiData: ApiException[]): Exception[] => {
  return apiData.map((item) => {
    const { l04, l06 } = parseBookPath(item.sdsBookPath);
    const createdDate = new Date(item.asOfTime);
    const dueDate = new Date(createdDate);
    dueDate.setDate(createdDate.getDate() + 14); // Assuming a 14-day SLA for due date

    return {
      id: item.exceptionId,
      l04_business_area_name: l04,
      l06_name: l06,
      named_no_name: 'N/A', // Field not present in new API
      ads_book_code: String(item.sdsBookCode),
      ads_book_path: item.sdsBookPath,
      system: item.system,
      legal_entity: item.legalEntity,
      regulator: item.regulator,
      instrument_id: String(item.instrumentId),
      equity_class_path: item.equityClassType, // Mapping equityClassType to equity_class_path
      instrument_type: item.instrumentType,
      instrument_name: item.instrumentName,
      position_tbbb_classification: item.positionBbbClassification,
      as_of_time: item.asOfTime,
      bb_underlying: item.bbUnderlyings,
      reason: 'N/A', // Field not present in new API
      look_through: item.lookThrough,
      sod_dealt_bb_underlying: String(item.sodDeltaOnBbUnderlying),
      position_av: item.positionAv,
      tetb_av: 0, // Field not present in new API
      position_qty: item.positionQty,
      tetb_qty: 0, // Field not present in new API
      tetb_match: false, // Field not present in new API
      
      // Calculated/Defaulted functional fields
      status: (item.status as Exception['status']) || 'Challenge', // Default to 'Challenge' if null
      priority: getPriority(item.aging),
      sla_status: getSlaStatus(item.aging),
      assigned_to: 'Unassigned',
      created_date: createdDate.toISOString(),
      due_date: dueDate.toISOString(),
      aging_days: item.aging,
    };
  });
};

// Fetches and transforms exception data from the new API
export const fetchAndTransformExceptions = async (): Promise<Exception[]> => {
  try {
    // IMPORTANT: This is a direct call to an HTTP endpoint.
    // In a real-world scenario, you might face CORS issues if the API server
    // is not configured to allow requests from your app's domain.
    // This can be solved by:
    // 1. Enabling CORS on the API server (e.g., sgppwavd1049806:8080).
    // 2. Using a proxy through your Next.js app to bypass browser CORS restrictions.
    const response = await fetch('http://sgppwavd1049806:8080/api/exceptions');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiException[] = await response.json();
    return transformApiExceptions(data);
  } catch (error) {
    console.error("Failed to fetch or transform exception data:", error);
    // Return an empty array or mock data in case of an error
    return [];
  }
};