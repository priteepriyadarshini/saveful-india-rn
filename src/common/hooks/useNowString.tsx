import moment from 'moment';
import React from 'react';

export default function useNowString(
  updateInterval: number | undefined = 600000,
) {
  const [now, setNow] = React.useState(() => {
    return moment().utcOffset(0, true).toDate().toISOString();
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment().utcOffset(0, true).toDate().toISOString());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return now;
}
