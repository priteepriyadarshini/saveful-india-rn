import React from 'react';
import { ViewToken } from 'react-native';


export default function useFlatListViewableItemsCurrentPage(pageSize: number) {
  const [currentPage, setCurrentPage] = React.useState<number>(1);

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

  return { currentPage, viewableItemsChanged };
}
