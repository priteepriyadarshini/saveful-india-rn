import { PaginationParams } from "./types";

export function addPaginationParamsToURLSearchParams(
  searchParams: URLSearchParams,
  paginationParams: PaginationParams,
) {
  if (paginationParams?.page) {
    searchParams.set('page', paginationParams.page.toString());
  }

  if (paginationParams?.page_size) {
    searchParams.set('page_size', paginationParams.page_size.toString());
  }
}
