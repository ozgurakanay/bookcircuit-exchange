const CET_TIMEZONE = 'Europe/Berlin'; // CET/CEST

/**
 * Formats a date/time string or Date object into a user-friendly string 
 * relative to the current time, displayed in CET/CEST.
 * - Today: Shows time (HH:MM)
 * - Yesterday: Shows "Yesterday"
 * - Within last 7 days: Shows weekday name (e.g., "Mon")
 * - Older: Shows date (e.g., "Mar 28")
 * @param {string | Date} dateInput - The date/time to format (ISO string or Date object)
 * @returns {string} - Formatted date/time string
 */
export const formatRelativeTimeCET = (dateInput) => {
  if (!dateInput) return '';

  try {
    const date = new Date(dateInput);
    const now = new Date();

    const dateInCET = new Date(date.toLocaleString('en-US', { timeZone: CET_TIMEZONE }));
    const nowInCET = new Date(now.toLocaleString('en-US', { timeZone: CET_TIMEZONE }));

    // Reset time parts for day comparison
    const dateDayStart = new Date(dateInCET); // Use CET date
    dateDayStart.setHours(0, 0, 0, 0);
    const nowDayStart = new Date(nowInCET); // Use CET date
    nowDayStart.setHours(0, 0, 0, 0);

    const diffDays = (nowDayStart.getTime() - dateDayStart.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 1 && dateDayStart.getTime() === nowDayStart.getTime()) { // Today
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: CET_TIMEZONE,
      }).format(date);
    } else if (diffDays >= 1 && diffDays < 2) { // Yesterday
      return 'Yesterday';
    } else if (diffDays >= 2 && diffDays < 7) { // Within the last week
      return new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        timeZone: CET_TIMEZONE,
      }).format(date);
    } else { // Older than a week
      return new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        day: 'numeric',
        timeZone: CET_TIMEZONE,
      }).format(date);
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date/time string or Date object into just the time (HH:MM) in CET/CEST.
 * @param {string | Date} dateInput - The date/time to format (ISO string or Date object)
 * @returns {string} - Formatted time string (HH:MM)
 */
export const formatTimeCET = (dateInput) => {
   if (!dateInput) return '';
   try {
     const date = new Date(dateInput);
     return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: CET_TIMEZONE,
      }).format(date);
   } catch (error) {
     console.error("Error formatting time:", error);
     return 'Invalid Time';
   }
};

/**
 * Formats a date/time string or Date object into the date string used for grouping, in CET/CEST.
 * @param {string | Date} dateInput - The date/time to format (ISO string or Date object)
 * @returns {string} - Formatted date string (e.g., "28 March 2025")
 */
export const formatDateCETForGrouping = (dateInput) => {
   if (!dateInput) return '';
   try {
     const date = new Date(dateInput);
     return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: CET_TIMEZONE,
      }).format(date);
   } catch (error) {
     console.error("Error formatting date for grouping:", error);
     return 'Invalid Date';
   }
};

/**
 * Returns a human-readable string for a date compared to today, in CET/CEST.
 * e.g., "Today", "Yesterday", "28 March 2025"
 * @param {string} dateString - The date string (e.g., from formatDateCETForGrouping)
 * @returns {string} - Human-readable date string
 */
export const formatGroupDateCET = (dateString) => {
  if (!dateString) return '';
  try {
    // Get today's date string in the same format for comparison
    const now = new Date();
    const todayString = formatDateCETForGrouping(now);
    
    // Get yesterday's date string
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayString = formatDateCETForGrouping(yesterday);

    if (dateString === todayString) {
      return 'Today';
    } else if (dateString === yesterdayString) {
      return 'Yesterday';
    } else {
      return dateString; // Return the full date string if older
    }

  } catch (error) {
    console.error("Error formatting group date:", error);
    return dateString; // Fallback to the original string
  }
}; 