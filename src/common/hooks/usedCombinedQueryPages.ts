import { PagedDataResponse } from '../../modules/api/types';
import React from 'react';

export type Placeholder = 'placeholder';

// Combines previous / current / next page data into a single list, with placeholder items for items that are not loaded yet
export default function useCombinedQueryPages<T>(
  currentPage: number,
  pageSize: number,
  lastResult: PagedDataResponse<T[]> | undefined,
  currentResult: PagedDataResponse<T[]> | undefined,
  nextResult: PagedDataResponse<T[]> | undefined,
) {
  const combined: (T | Placeholder)[] = React.useMemo(() => {
    // Create an array big enough to hold all the items for previous + current + next page
    const arraySize = Math.min(
      pageSize * (currentPage + 1),
      currentResult?.page?.total_entries ?? pageSize * (currentPage + 1),
    );

    // Fill the array with placeholders
    const arr = new Array(arraySize).fill('placeholder');

    // Insert the pages into the array
    [lastResult, currentResult, nextResult].forEach(data => {
      if (data) {
        const offset = (data.page.page_number - 1) * data.page.page_size;
        arr.splice(offset, data.data.length, ...data.data);
      }
    });
    return arr;
  }, [pageSize, currentPage, currentResult, lastResult, nextResult]);

  return combined;
}
