import { Book } from '../models/book';

export class ValidationUtils {
	static validateAndFixBook(book: Partial<Book>): Partial<Book> {
		const fixed: Partial<Book> = { ...book };

		if (fixed.readPage !== undefined && fixed.readPage < 0) {
			fixed.readPage = 0;
		}

		if (fixed.totalPages !== undefined && fixed.totalPages < 0) {
			fixed.totalPages = undefined;
		}

		if (fixed.readPage !== undefined && fixed.totalPages !== undefined) {
			if (fixed.readPage > fixed.totalPages) {
				fixed.readPage = fixed.totalPages;
			}
		}

		if (fixed.status && !['unread', 'reading', 'finished'].includes(fixed.status)) {
			fixed.status = 'unread';
		}

		if (!fixed.title || fixed.title.trim().length === 0) {
			fixed.title = 'Unknown title';
		}

		return fixed;
	}
}
