/**
 * Interface representing a reading record
 */
export interface ReadingRecord {
	/** Reading date (YYYY-MM-DD format) */
	date: string;
	/** Start page */
	startPage: number;
	/** End page */
	endPage: number;
	/** Pages read (auto-calculated: endPage - startPage) */
	pagesRead: number;
	/** Notes (optional) */
	notes?: string;
	/** Timestamp (optional) */
	timestamp?: string;
}

/**
 * Utility function to create a ReadingRecord
 * @param startPage Start page
 * @param endPage End page
 * @param notes Notes (optional)
 * @param date Date (default: today)
 */
export function createReadingRecord(
	startPage: number,
	endPage: number,
	notes?: string,
	date?: string
): ReadingRecord {
	const now = new Date();
	const recordDate: string = date ?? now.toISOString().split('T')[0] ?? '';
	const timestamp: string = now.toISOString().replace('T', ' ').substring(0, 19);

	return {
		date: recordDate,
		startPage,
		endPage,
		pagesRead: endPage - startPage,
		notes,
		timestamp,
	};
}

/**
 * Get the last endPage from previous records
 * @param history Array of reading records
 * @returns Last endPage or 0
 */
export function getLastEndPage(history: ReadingRecord[]): number {
	if (history.length === 0) {
		return 0;
	}
	// Sort by date and return the most recent record's endPage
	const sorted = [...history].sort((a, b) => 
		new Date(b.date).getTime() - new Date(a.date).getTime()
	);
	const latest = sorted[0];
	return latest ? latest.endPage : 0;
}
