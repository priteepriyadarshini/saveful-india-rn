import { monthNames } from "./dateFormat";

function formatMonths(months: string[]): string {
  const inputMonths = months.map(month => month.toLowerCase());

  const formattedOutput: string[] = [];
  let startMonth: string = '';
  let endMonth: string = '';

  for (const monthName of monthNames) {
    if (inputMonths.includes(monthName)) {
      if (!startMonth) {
        startMonth = monthName;
        endMonth = monthName;
      } else {
        endMonth = monthName;
      }
    } else {
      if (startMonth) {
        if (startMonth === endMonth) {
          formattedOutput.push(
            startMonth.charAt(0).toUpperCase() + startMonth.slice(1),
          );
        } else {
          formattedOutput.push(
            `${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} - ${
              endMonth.charAt(0).toUpperCase() + endMonth.slice(1)
            }`,
          );
        }
        startMonth = '';
        endMonth = '';
      }
    }
  }

  if (startMonth) {
    if (startMonth === endMonth) {
      formattedOutput.push(
        startMonth.charAt(0).toUpperCase() + startMonth.slice(1),
      );
    } else {
      formattedOutput.push(
        `${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} - ${
          endMonth.charAt(0).toUpperCase() + endMonth.slice(1)
        }`,
      );
    }
  }

  const result = formattedOutput.join(', ');

  return result;
}

export default formatMonths;
