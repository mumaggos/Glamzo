import { formatInTimeZone, toDate } from 'date-fns-tz';

export function createUTCBookingTimestamp(dateString: string, timeString: string, shopTimezone: string = 'Europe/Lisbon'): string {
  const dateTimeString = `${dateString}T${timeString}:00`;
  const dateInTimezone = toDate(dateTimeString, { timeZone: shopTimezone });
  return dateInTimezone.toISOString();
}

export function formatZonedDateTime(utcTimestamp: string | Date, shopTimezone: string = 'Europe/Lisbon', formatString: string): string {
  return formatInTimeZone(utcTimestamp, shopTimezone, formatString);
}
