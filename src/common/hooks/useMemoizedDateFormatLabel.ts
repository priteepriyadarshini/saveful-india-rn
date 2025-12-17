import moment from 'moment';
import { useMemo } from 'react';

export enum DateFormats {
  Date = 'D MMM YYYY',
  DateTime = 'D MMM YYYY, h:mm a',
  DayDate = 'ddd D MMM YYYY',
  DayDateTime = 'ddd D MMM YYYY, h:mm a',
  DayMonthYear = 'DD/MM/YY',
  MonthYear = 'MM/YY',
  MonthYearFull = 'MMM YYYY',
  Time = 'h:mm a',
}

export function useMemoizedDateFormatLabel(
  date: Date | string | undefined | null,
  formatString = DateFormats.Date,
  emptyString = '',
) {
  return useMemo(() => {
    if (date === undefined || date === null) {
      return emptyString;
    } else {
      return moment.utc(date).local().format(formatString);
    }
  }, [date, emptyString, formatString]);
}
