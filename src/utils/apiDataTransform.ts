import { ApiException, Exception, CoreException, ExceptionCategory } from "@/types/exception";
import { transformCoreToFunctional } from './dataTransform';
import { apiService } from './apiService';
import mockData from '../data/exceptions-100.json';

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

// Cache for exception categories with expiration
let categoriesCache: { data: ExceptionCategory[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get category name by ID with memoization
const categoryNameCache = new Map<string, string>();

const getCategoryName = (categoryId: string | null, categories: ExceptionCategory[]): string => {
  if (!categoryId || !categories.length) return 'N/A';
  
  // Check cache first
  const cacheKey = `${categoryId}-${categories.length}`;
  if (categoryNameCache.has(cacheKey)) {
    return categoryNameCache.get(cacheKey)!;
  }
  
  const category = categories.find(cat => cat.id.toString() === categoryId);
  const result = category ? category.categoryName : 'N/A';
  
  // Cache the result
  categoryNameCache.set(cacheKey, result);
  return result;
};

// Fetch exception categories with caching and error handling
export const fetchExceptionCategories = async (): Promise<ExceptionCategory[]> => {
  // Check cache validity
  if (categoriesCache && (Date.now() - categoriesCache.timestamp) < CACHE_DURATION) {
    return categoriesCache.data;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (apiUrl && apiUrl !== 'mock') {
    try {
      const response = await apiService.getExceptionCategories();
      if (response.success && response.data) {
        categoriesCache = {
          data: response.data,
          timestamp: Date.now()
        };
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
  
  categoriesCache = {
    data: mockCategories,
    timestamp: Date.now()
  };
  return mockCategories;
};

// Optimized book path parsing with memoization
const bookPathCache = new Map<string, { l04: string, l06: string }>();

const parseBookPath = (bookPath: string): { l04: string, l06: string } => {
  if (bookPathCache.has(bookPath)) {
    return bookPathCache.get(bookPath)!;
  }
  
  const parts = bookPath.split(':');
  const result = {
    l04: parts.length > 3 ? parts[3] : 'N/A',
    l06: parts.length > 6 ? parts[6] : 'N/A'
  };
  
  bookPathCache.set(bookPath, result);
  return result;
};

// Optimized date calculations
const calculateDueDate = (createdDate: Date): Date => {
  const dueDate = new Date(createdDate);
  dueDate.setDate(createdDate.getDate() + 14); // Assuming a 14-day SLA for due date
  return dueDate;
};

// Transforms the raw API data into the format the UI components expect
export const transformApiExceptions = async (apiData: ApiException[]): Promise<Exception[]> => {
  // Fetch categories for mapping once
  const categories = await fetchExceptionCategories();
  
  // Pre-calculate common values to avoid repeated calculations
  const currentTime = Date.now();
  
  return apiData.map((item) => {
    const { l04, l06 } = parseBookPath(item.sdsBookPath);
    const createdDate = new Date(item.asOfTime);
    const dueDate = calculateDueDate(createdDate);
    const status = mapStatus(item.status);
    const priority = getPriority(item.aging);
    const slaStatus = getSlaStatus(item.aging);
    const categoryName = getCategoryName(item.categoryId, categories);

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
      status,
      categoryId: item.categoryId,
      categoryName,
      priority,
      sla_status: slaStatus,
      assigned_to: 'Unassigned',
      created_date: createdDate.toISOString(),
      due_date: dueDate.toISOString(),
      aging_days: item.aging,
    };
  });
};

// Optimized data fetching with better error handling and caching
let dataCache: { data: Exception[]; timestamp: number } | null = null;
const DATA_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const fetchAndTransformExceptions = async (forceRefresh = false): Promise<Exception[]> => {
  // Check cache validity unless force refresh is requested
  if (!forceRefresh && dataCache && (Date.now() - dataCache.timestamp) < DATA_CACHE_DURATION) {
    return dataCache.data;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl && apiUrl !== 'mock') {
    try {
      // Use the API service to fetch exceptions with page size 100
      const response = await apiService.getExceptions(100);
      
      if (response.success && response.data) {
        const transformedData = await transformApiExceptions(response.data);
        
        // Cache the result
        dataCache = {
          data: transformedData,
          timestamp: Date.now()
        };
        
        return transformedData;
      } else {
        throw new Error(response.error || 'Failed to fetch exceptions');
      }
    } catch (error) {
      console.error("Failed to fetch or transform API data:", error);
      console.log("Falling back to mock data due to API error.");
      
      // Fallback to mock data in case of API error
      const mockExceptions = (mockData as any).exceptions || mockData;
      const mockTransformed = Array.isArray(mockExceptions) ? mockExceptions : transformCoreToFunctional(mockData as any);
      
      // Cache mock data with shorter duration
      dataCache = {
        data: mockTransformed,
        timestamp: Date.now() - (DATA_CACHE_DURATION / 2) // Shorter cache for mock data
      };
      
      return mockTransformed;
    }
  } else {
    // Use mock data if no API_URL is provided or if it's set to 'mock'
    console.log("Using mock data.");
    
    // Handle the new mock data format which has an 'exceptions' property
    const mockExceptions = (mockData as any).exceptions || mockData;
    
    // If the mock data is already in the correct format, use it directly
    if (Array.isArray(mockExceptions) && mockExceptions.length > 0 && mockExceptions[0].id) {
      // Cache mock data
      dataCache = {
        data: mockExceptions,
        timestamp: Date.now()
      };
      
      return mockExceptions;
    } else {
      // Fallback to transformation if needed
      const mockTransformed = transformCoreToFunctional(mockData as any);
      
      // Cache mock data
      dataCache = {
        data: mockTransformed,
        timestamp: Date.now()
      };
      
      return mockTransformed;
    }
  }
};

// Clear cache function for manual refresh
export const clearDataCache = (): void => {
  dataCache = null;
  categoriesCache = null;
  categoryNameCache.clear();
  bookPathCache.clear();
};