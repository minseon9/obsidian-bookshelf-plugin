/**
 * Frontmatter data structure
 */
export interface Frontmatter {
	title?: string;
	subtitle?: string;
	author?: string[];
	category?: string[];
	publisher?: string;
	publish?: string;
	isbn?: string;
	cover?: string;
	total?: number;
	totalPages?: number;
	status?: string;
	read_page?: number;
	read_started?: string;
	read_finished?: string | null;
	created?: string;
	updated?: string;
	reading_history_summary?: ReadingHistorySummaryItem[];
	[key: string]: unknown;
}

/**
 * Reading history summary item
 */
export interface ReadingHistorySummaryItem {
	date: string;
	startPage: number;
	endPage: number;
	pagesRead: number;
	timestamp: string;
	notes?: string;
}
