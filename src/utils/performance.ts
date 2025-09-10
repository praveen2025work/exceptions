// Performance monitoring utilities

export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window !== 'undefined' && window.performance) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

export const measureAsyncPerformance = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  if (typeof window !== 'undefined' && window.performance) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  } else {
    return await fn();
  }
};

// Debounce utility for search and filter inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling helper for large lists
export const calculateVisibleRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 5
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex };
};

// Memory usage monitoring (development only)
export const logMemoryUsage = () => {
  if (typeof window !== 'undefined' && (window as any).performance?.memory && process.env.NODE_ENV === 'development') {
    const memory = (window as any).performance.memory;
    console.log('Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
    });
  }
};

// Component render tracking (development only)
export const useRenderTracker = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    const renderCount = React.useRef(0);
    renderCount.current++;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  }
};

// Import React for useRef
import React from 'react';