import { ApiException, Exception, CoreException, ExceptionCategory } from "@/types/exception";
import { transformCoreToFunctional } from './dataTransform';
import { apiService } from './apiService';
import mockData from '../data/core-exceptions.json';

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

// Helper function to map old status values to new ones
const mapStatus = (oldStatus: string | null): Exception['status'] => {
  if (!oldStatus) return 'Open';
  
  switch (oldStatus.toLowerCase()) {
    case 'unwind':
    case 'centralise':
    case 'writedown':
      return 'Resolved';
    case 'challenge':
    case 'insufficient data':
      return 'In Progress';
    case 'reassignment':
      return 'Open';
    default:
      return 'Open';
  }
};

// Cache for exception categories
let categoriesCache: ExceptionCategory[] | null = null;

// Helper function to get category name by ID
const getCategoryName = (categoryId: string | null, categories: ExceptionCategory[]): string => {
  if (!categoryId || !categories.length) return 'N/A';
  
  const category = categories.find(cat => cat.id.toString() === categoryId);
  return category ? category.categoryName : 'N/A';
};

// Fetch exception categories
export const fetchExceptionCategories = async (): Promise<ExceptionCategory[]> => {
  if (categoriesCache) {
    return categoriesCache;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (apiUrl && apiUrl !== 'mock') {
    try {
      const response = await apiService.getExceptionCategories();
      if (response.success && response.data) {
        categoriesCache = response.data;
        return response.data;
      }
    } catch (error) {
      console.error("Failed to fetch exception categories:", error);
    }
  }
  
  // Mock categories for fallback
  const mockCategories: ExceptionCategory[] = [
    { id: 2, categoryName: "FO Unwind", classification: "BankingBook" },
    { id: 3, categoryName: "FO Challenge", classification: "BankingBook" },
    { id: 4, categoryName: "FO Request Reassignment", classification: "BankingBook" }
  ];
  
  categoriesCache = mockCategories;
  return mockCategories;
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
export const transformApiExceptions = async (apiData: ApiException[]): Promise<Exception[]> => {
  // Fetch categories for mapping
  const categories = await fetchExceptionCategories();
  
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
      tetb_qty: item.originalQty, // Use originalQty for tetb_qty
      tetb_match: false, // Field not present in new API
      
      // Calculated/Defaulted functional fields
      status: mapStatus(item.status), // Use new status mapping
      categoryId: item.categoryId,
      categoryName: getCategoryName(item.categoryId, categories),
      priority: getPriority(item.aging),
      sla_status: getSlaStatus(item.aging),
      assigned_to: 'Unassigned',
      created_date: createdDate.toISOString(),
      due_date: dueDate.toISOString(),
      aging_days: item.aging,
    };
  });
};

// Fetches and transforms exception data from the new API or uses mock data
export const fetchAndTransformExceptions = async (): Promise<Exception[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl && apiUrl !== 'mock') {
    try {
      // Use the API service to fetch exceptions with page size 100
      const response = await apiService.getExceptions(100);
      
      if (response.success && response.data) {
        return await transformApiExceptions(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch exceptions');
      }
    } catch (error) {
      console.error("Failed to fetch or transform API data:", error);
      console.log("Falling back to mock data due to API error.");
      // Fallback to mock data in case of API error
      return transformCoreToFunctional(mockData as CoreException[]);
    }
  } else {
    // Use mock data if no API_URL is provided or if it's set to 'mock'
    console.log("Using mock data.");
    return transformCoreToFunctional(mockData as CoreException[]);
  }
};