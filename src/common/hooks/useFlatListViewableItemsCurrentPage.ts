import React from 'react';
import { ViewToken } from 'react-native';

// Helper hook that returns a viewableItemsChanged handler that you can
// apply to a `FlatList` that will then return the current visible page
// helpful for infinite scrolling lists with API paging
export default function useFlatListViewableItemsCurrentPage(pageSize: number) {
  // Store the current page, starting on 1
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Callback for the viewable items change handler
  const viewableItemsChanged = React.useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const endIndex =
        info.viewableItems.length > 0
          ? info.viewableItems[info.viewableItems.length - 1].index ?? 0
          : 0;

      const visiblePage = Math.max(1, Math.floor(endIndex / pageSize));
      setCurrentPage(visiblePage);
    },
    [pageSize],
  );

  // Return the current page and the handler for use in your component
  return { currentPage, viewableItemsChanged };
}
