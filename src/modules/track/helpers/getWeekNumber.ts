const getWeekNumber = (
  inputDate: Date,
  weekStart: string = 'sunday',
): number => {
  const date = new Date(inputDate);
  date.setHours(0, 0, 0, 0); // Normalize time to midnight

  const daysOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const weekStartIndex = daysOfWeek.indexOf(weekStart.toLowerCase());

  // Find the Thursday in this week based on the adjusted weekStart
  date.setDate(
    date.getDate() + (4 - ((date.getDay() - weekStartIndex + 7) % 7)),
  );

  // Get the first day of the year
  const yearStart = new Date(date.getFullYear(), 0, 1);

  // Calculate the difference in days
  const diff = Math.floor((date.getTime() - yearStart.getTime()) / 86400000); // 86400000 ms in a day

  // Calculate the week number
  const weekNumber = Math.ceil((diff + 1) / 7);

  return weekNumber;
};

export const getWeekForSurvey = (weekStart: string = 'sunday'): number => {
  return new Date().getFullYear() * 100 + getWeekNumber(new Date(), weekStart);
};

export default getWeekNumber;
