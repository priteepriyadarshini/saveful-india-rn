import moment from 'moment';
import { useMemo } from 'react';

export default function useCustomDateLabel(
  date: Date | string | undefined | null,
  todaysDayformatString: string | undefined = '[Today], MMMM D YYYY',
  lastDayformatString: string | undefined = '[Yesterday], MMMM D YYYY',
  otherDaysformatString: string | undefined = 'dddd, MMMM D YYYY',
) {
  return useMemo(() => {
    if (!date) {
      return undefined;
    }

    return moment(new Date(date))
      .utcOffset(0, false)
      .calendar(moment(new Date()).utcOffset(0, true), {
        sameDay: todaysDayformatString,
        lastDay: lastDayformatString,
        lastWeek: otherDaysformatString,
        sameElse: otherDaysformatString,
      });
  }, [date, lastDayformatString, otherDaysformatString, todaysDayformatString]);
}
