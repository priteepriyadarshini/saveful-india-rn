export interface DataResponse<T> {
  data: T;
}

export interface PagedDataResponse<T> extends DataResponse<T> {
  data: T;
  page: {
    page_number: number;
    page_size: number;
    total_entries: number;
    total_pages: number;
  };
}

export interface PaginationParams {
  page_size?: number;
  page?: number;
}
