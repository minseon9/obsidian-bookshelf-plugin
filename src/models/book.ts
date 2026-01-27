/**
 * Interface representing book information
 */
export interface Book {
	// Basic information
	title: string;
	subtitle?: string;
	author: string[];
	isbn10?: string;
	isbn13?: string;

	// Publication information
	publisher?: string;
	publishDate?: string;
	totalPages?: number;

	// Metadata
	coverUrl?: string;
	localCover?: string;
	category?: string[];

	// Reading status
	status: BookStatus;
	readPage?: number;
	readStarted?: string;
	readFinished?: string;

	// Timestamps
	created: string;
	updated: string;
}

/**
 * Book reading status
 */
export type BookStatus = 'unread' | 'reading' | 'finished';

/**
 * Utility function to convert book data from Open Library API to Book interface
 */
export function createBookFromData(data: Partial<Book>): Book {
	const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

	return {
		title: data.title || 'Unknown Title',
		subtitle: data.subtitle,
		author: data.author || [],
		isbn10: data.isbn10,
		isbn13: data.isbn13,
		publisher: data.publisher,
		publishDate: data.publishDate,
		totalPages: data.totalPages,
		coverUrl: data.coverUrl,
		localCover: data.localCover,
		category: data.category || [],
		status: data.status || 'unread',
		readPage: data.readPage || 0,
		readStarted: data.readStarted,
		readFinished: data.readFinished,
		created: data.created || now,
		updated: data.updated || now,
	};
}
