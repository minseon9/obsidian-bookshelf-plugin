/**
 * Date utility functions with timezone support
 */

let timezoneOffset = 0;

/**
 * Set timezone offset for date formatting
 * @param offset Timezone offset in hours (e.g., 0 for UTC, 9 for KST)
 */
export function setTimezoneOffset(offset: number): void {
	timezoneOffset = offset;
}

/**
 * Get current timezone offset
 * @returns Current timezone offset in hours
 */
export function getTimezoneOffset(): number {
	return timezoneOffset;
}

/**
 * Format date according to the given format string with timezone adjustment
 * @param date Date object or date string
 * @param format Format string (default: "YYYY-MM-DD HH:mm:ss")
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	
	// Apply timezone offset
	const utcTime = d.getTime() + (d.getTimezoneOffset() * 60000);
	const adjustedTime = new Date(utcTime + (timezoneOffset * 3600000));

	const year = adjustedTime.getFullYear();
	const month = String(adjustedTime.getMonth() + 1).padStart(2, '0');
	const day = String(adjustedTime.getDate()).padStart(2, '0');
	const hours = String(adjustedTime.getHours()).padStart(2, '0');
	const minutes = String(adjustedTime.getMinutes()).padStart(2, '0');
	const seconds = String(adjustedTime.getSeconds()).padStart(2, '0');

	return format
		.replace(/YYYY/g, String(year))
		.replace(/MM/g, month)
		.replace(/DD/g, day)
		.replace(/HH/g, hours)
		.replace(/mm/g, minutes)
		.replace(/ss/g, seconds);
}

/**
 * Get current date/time formatted string (always "YYYY-MM-DD HH:mm:ss")
 * @returns Formatted current date/time string
 */
export function getCurrentDateTime(): string {
	return formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
}

/**
 * Get current date formatted string (always "YYYY-MM-DD")
 * @returns Formatted current date string
 */
export function getCurrentDate(): string {
	return formatDate(new Date(), 'YYYY-MM-DD');
}
