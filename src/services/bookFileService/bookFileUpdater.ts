import { App, TFile } from 'obsidian';
import { Book } from '../../models/book';
import { ReadingRecord } from '../../models/readingRecord';
import { FrontmatterParser } from '../frontmatterService/frontmatterParser';
import { FrontmatterConverter } from '../frontmatterService/frontmatterConverter';
import { FrontmatterCreator } from '../frontmatterService/frontmatterCreator';
import { ReadingHistoryManager } from '../frontmatterService/readingHistoryManager';
import { getCurrentDateTime } from '../../utils/dateUtils';

export class BookFileUpdater {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	async updateBook(file: TFile, updates: Partial<Book>): Promise<void> {
		const content = await this.app.vault.read(file);
		const { frontmatter, body } = FrontmatterParser.extract(content);
		const existingBook = FrontmatterConverter.frontmatterToBook(frontmatter);
		const updatedBook: Partial<Book> = { ...existingBook, ...updates };
		const updatedFrontmatter = FrontmatterConverter.bookToFrontmatter(updatedBook as Book);
		updatedFrontmatter.updated = new Date().toISOString().replace('T', ' ').substring(0, 19);
		const frontmatterString = FrontmatterCreator.create(updatedFrontmatter);
		const newContent = `${frontmatterString}\n${body}`;
		await this.app.vault.modify(file, newContent);
	}

	async updateReadingProgress(
		file: TFile,
		endPage: number,
		startPage: number,
		notes?: string,
		autoStatusChange: boolean = true
	): Promise<void> {
		const content = await this.app.vault.read(file);
		const { frontmatter, body } = FrontmatterParser.extract(content);
		
		frontmatter.read_page = endPage;

		if (autoStatusChange) {
			const totalPages = typeof frontmatter.total === 'number' 
				? frontmatter.total 
				: (typeof frontmatter.totalPages === 'number' ? frontmatter.totalPages : undefined);
			
			if (totalPages && endPage >= totalPages) {
				frontmatter.status = 'finished';
				if (!frontmatter.read_finished) {
					frontmatter.read_finished = getCurrentDateTime();
				}
			} else if (endPage > 0 && frontmatter.status === 'unread') {
				frontmatter.status = 'reading';
				if (!frontmatter.read_started) {
					frontmatter.read_started = getCurrentDateTime();
				}
			}
		}

		frontmatter.updated = getCurrentDateTime();

		const existingHistory = ReadingHistoryManager.parseFromBody(body);
		const lastRecord = existingHistory.length > 0 ? existingHistory[existingHistory.length - 1] : null;
		const recordStartPage = startPage !== undefined 
			? startPage 
			: (lastRecord?.endPage ?? frontmatter.read_page ?? 0);

		const newRecord = ReadingHistoryManager.createRecord(recordStartPage, endPage, notes);
		existingHistory.push(newRecord);

		if (!frontmatter.reading_history_summary || !Array.isArray(frontmatter.reading_history_summary)) {
			frontmatter.reading_history_summary = [];
		}
		
		frontmatter.reading_history_summary.push({
			date: newRecord.date,
			startPage: newRecord.startPage,
			endPage: newRecord.endPage,
			pagesRead: newRecord.pagesRead,
			timestamp: newRecord.timestamp,
		});

		const updatedBody = ReadingHistoryManager.updateInBody(body, existingHistory);
		const frontmatterString = FrontmatterCreator.create(frontmatter);
		const updatedContent = `${frontmatterString}\n${updatedBody}`;
		await this.app.vault.modify(file, updatedContent);
	}
}
