export function convertDateToTimestamp(inputDate: string, year: number): string | null {
    if (!inputDate) return null;

    const months: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
    };
  
    // Extract the month and day from the inputDate string
    const [monthName, day] = inputDate.split(' ');
    const month = months[monthName];
  
    // Check if the month and day are valid
    if (!month || isNaN(Number(day))) {
      return null;
    }
  
    // Construct the timestamp string in 'YYYY-MM-DD' format
    const timestamp = `${year}-${month}-${day.padStart(2, '0')}`;
  
    return timestamp;
}

