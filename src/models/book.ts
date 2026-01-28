import { BookStatus } from './bookStatus';

export interface Book {
	// Basic information
	title: string;
	subtitle?: string;
	author: string[];

	// Publication information
	publisher?: string;
	publishDate?: string;
	totalPages?: number;
	isbn10?: string;
	isbn13?: string;

	// Metadata
	coverUrl?: string;
	category?: string[];
	coverEditionKey?: string;

	// Reading status
	status: BookStatus;
	readPage?: number;
	readStarted?: string;
	readFinished?: string;

	// Timestamps
	created: string;
	updated: string;
}

