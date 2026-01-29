import { Book } from '../../models/book';
import { getCurrentDateTime } from '../../utils/dateUtils';
import { Frontmatter } from './types';

export class FrontmatterConverter {
	static bookToFrontmatter(book: Book): Frontmatter {
		const now = getCurrentDateTime();
		const created = book.created || now;
		
		const frontmatter: Frontmatter = {
			title: book.title || '',
			subtitle: book.subtitle || '',
			author: book.author || [],
			category: book.category || [],
			publisher: book.publisher || '',
			publish: book.publishDate || '',
			isbn: '',
			cover: book.coverUrl || '',
			total: 0,
			status: book.status || 'unread',
			read_page: book.readPage || 0,
			read_started: book.readStarted !== undefined ? book.readStarted : created,
			read_finished: book.readFinished || null,
			created: created,
			updated: book.updated || now,
		};

		// Set total pages
		if (book.totalPages !== undefined && book.totalPages !== null && !isNaN(book.totalPages)) {
			frontmatter.total = book.totalPages;
		}

		// Set ISBN
		const isbn = `${book.isbn10 || ''} ${book.isbn13 || ''}`.trim();
		if (isbn) {
			frontmatter.isbn = isbn;
		}

		return frontmatter;
	}

	static frontmatterToBook(frontmatter: Frontmatter): Partial<Book> {
		const { isbn10, isbn13 } = FrontmatterConverter.extractIsbn(frontmatter.isbn);
		const calculatedReadPage = FrontmatterConverter.calculateReadPage(frontmatter);

		const status = frontmatter.status;
		const validStatus = status === 'unread' || status === 'reading' || status === 'finished' ? status : 'unread';
		
		return {
			title: frontmatter.title || '',
			subtitle: frontmatter.subtitle,
			author: Array.isArray(frontmatter.author) ? frontmatter.author : [],
			category: Array.isArray(frontmatter.category) ? frontmatter.category : [],
			publisher: frontmatter.publisher,
			publishDate: frontmatter.publish,
			totalPages: typeof frontmatter.total === 'number' ? frontmatter.total : undefined,
			isbn10,
			isbn13,
			coverUrl: frontmatter.cover,
			status: validStatus,
			readPage: calculatedReadPage,
			readStarted: frontmatter.read_started,
			readFinished: frontmatter.read_finished !== null ? frontmatter.read_finished : undefined,
			created: frontmatter.created || getCurrentDateTime(),
			updated: frontmatter.updated || getCurrentDateTime(),
		};
	}

	private static extractIsbn(isbnField: string | undefined): { isbn10?: string; isbn13?: string } {
		let isbn10: string | undefined;
		let isbn13: string | undefined;
		if (isbnField) {
			const isbns = String(isbnField).trim().split(/\s+/);
			for (const isbn of isbns) {
				if (isbn.length === 10) isbn10 = isbn;
				else if (isbn.length === 13) isbn13 = isbn;
			}
		}
		return { isbn10, isbn13 };
	}

	private static calculateReadPage(frontmatter: Frontmatter): number {
		let readPage = typeof frontmatter.read_page === 'number' ? frontmatter.read_page : 0;
		if (frontmatter.reading_history_summary && Array.isArray(frontmatter.reading_history_summary)) {
			const totalFromHistory = frontmatter.reading_history_summary.reduce(
				(sum, record) => sum + (record.pagesRead || 0),
				0
			);
			if (totalFromHistory > readPage) {
				readPage = totalFromHistory;
			}
		}
		return readPage;
	}
}
