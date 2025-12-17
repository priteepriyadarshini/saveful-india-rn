import { monthNames } from "./dateFormat";


function currentMonth(months: string[]): boolean {
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();

  return months.includes(monthNames[currentMonthIndex]);
}

export default currentMonth;
