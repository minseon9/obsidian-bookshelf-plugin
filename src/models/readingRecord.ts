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

