import { Book } from './book';

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
		category: data.category || [],
		coverEditionKey: data.coverEditionKey,
		status: data.status || 'unread',
		readPage: data.readPage || 0,
		readStarted: data.readStarted,
		readFinished: data.readFinished,
		created: data.created || now,
		updated: data.updated || now,
	};
}
