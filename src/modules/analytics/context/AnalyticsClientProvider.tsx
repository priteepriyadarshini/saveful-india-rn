import React from 'react';

function AnalyticsClientProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
  // const { client: segmentClient } = useAnalyticsClient();
  // return (
  //   <AnalyticsContext.Provider value={segmentClient}>
  //     <AnalyticsProvider client={segmentClient}>{children}</AnalyticsProvider>
  //   </AnalyticsContext.Provider>
  // );
}

export { AnalyticsClientProvider };
