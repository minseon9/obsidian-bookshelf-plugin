import { ReadingRecord } from './readingRecord';

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

export function getLastEndPage(history: ReadingRecord[]): number {
	if (history.length === 0) {
		return 0;
	}
	const sorted = [...history].sort((a, b) => 
		new Date(b.date).getTime() - new Date(a.date).getTime()
	);
	const latest = sorted[0];
	return latest ? latest.endPage : 0;
}
