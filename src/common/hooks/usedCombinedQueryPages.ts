import { PagedDataResponse } from '../../modules/api/types';
import React from 'react';

export type Placeholder = 'placeholder';

export default function useCombinedQueryPages<T>(
  currentPage: number,
  pageSize: number,
  lastResult: PagedDataResponse<T[]> | undefined,
  currentResult: PagedDataResponse<T[]> | undefined,
  nextResult: PagedDataResponse<T[]> | undefined,
) {
  const combined: (T | Placeholder)[] = React.useMemo(() => {
    const arraySize = Math.min(
      pageSize * (currentPage + 1),
      currentResult?.page?.total_entries ?? pageSize * (currentPage + 1),
    );

    const arr = new Array(arraySize).fill('placeholder');

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
