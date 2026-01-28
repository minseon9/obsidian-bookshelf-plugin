import { ReadingRecord } from '../../models/readingRecord';
import { getCurrentDateTime } from '../../utils/dateUtils';

export class ReadingHistoryManager {
	static parseFromBody(body: string): ReadingRecord[] {
		const history: ReadingRecord[] = [];
		const historySectionRegex = /^##\s+Reading History\s*\n([\s\S]*?)(?=\n##|\n#|$)/m;
		const match = body.match(historySectionRegex);
		
		if (!match || !match[1]) {
			return history;
		}

		const historyContent = match[1];
		const recordRegex = /(?:^###\s+(\d{4}-\d{2}-\d{2})|^-\s+\*\*Date:\*\*\s+(\d{4}-\d{2}-\d{2}))\s*\n([\s\S]*?)(?=\n(?:###|-\s+\*\*Date:)|$)/gm;
		let recordMatch;
		
		while ((recordMatch = recordRegex.exec(historyContent)) !== null) {
			const date = recordMatch[1] || recordMatch[2] || '';
			const recordText = recordMatch[3] || '';
			
			const startPageMatch = recordText.match(/(?:\*\*Start Page:\*\*|Start Page:|Start:|From:)\s*(\d+)/i);
			const endPageMatch = recordText.match(/(?:\*\*End Page:\*\*|End Page:|End:|To:|Page:)\s*(\d+)/i);
			const pagesReadMatch = recordText.match(/(?:\*\*Pages Read:\*\*|Pages Read:|Pages:|Read:)\s*(\d+)/i);
			const timestampMatch = recordText.match(/(?:\*\*Timestamp:\*\*|Timestamp:|Time:)\s*([^\n]+)/i);
			
			let notes: string | undefined;
			const notesMatch = recordText.match(/(?:Notes?:|Note:)\s*\n?([\s\S]*?)(?=\n(?:Time|Timestamp)|$)/i);
			if (notesMatch && notesMatch[1]) {
				notes = notesMatch[1].trim();
				if (notes === '') notes = undefined;
			}

			const record: ReadingRecord = {
				date: date,
				startPage: startPageMatch && startPageMatch[1] ? parseInt(startPageMatch[1], 10) : 0,
				endPage: endPageMatch && endPageMatch[1] ? parseInt(endPageMatch[1], 10) : 0,
				pagesRead: pagesReadMatch && pagesReadMatch[1] ? parseInt(pagesReadMatch[1], 10) : 0,
				notes: notes,
				timestamp: timestampMatch && timestampMatch[1] ? timestampMatch[1].trim() : undefined,
			};

			if (record.pagesRead === 0 && record.endPage > record.startPage) {
				record.pagesRead = record.endPage - record.startPage;
			}

			history.push(record);
		}

		return history;
	}

	static updateInBody(body: string, history: ReadingRecord[]): string {
		const historyLines: string[] = [];
		historyLines.push('## Reading History');
		historyLines.push('');

		const sortedHistory = [...history].sort((a, b) => {
			const dateA = a.timestamp || a.date || '';
			const dateB = b.timestamp || b.date || '';
			return dateB.localeCompare(dateA);
		});

		for (const record of sortedHistory) {
			historyLines.push(`### ${record.date || 'Unknown Date'}`);
			historyLines.push('');
			historyLines.push(`- **Start Page:** ${record.startPage ?? 0}`);
			historyLines.push(`- **End Page:** ${record.endPage ?? 0}`);
			historyLines.push(`- **Pages Read:** ${record.pagesRead ?? 0}`);
			if (record.timestamp) {
				historyLines.push(`- **Timestamp:** ${record.timestamp}`);
			}
			if (record.notes) {
				historyLines.push(`- **Notes:**`);
				historyLines.push('');
				const noteLines = record.notes.split('\n');
				for (const noteLine of noteLines) {
					historyLines.push(`  ${noteLine}`);
				}
			}
			historyLines.push('');
		}

		const historySection = historyLines.join('\n');
		const historySectionRegex = /^##\s+Reading History\s*\n[\s\S]*?(?=\n##|\n#|$)/m;
		let updatedBody = body;

		if (historySectionRegex.test(body)) {
			updatedBody = body.replace(historySectionRegex, historySection);
		} else {
			const firstHeadingRegex = /^(##\s+[^\n]+)/m;
			if (firstHeadingRegex.test(body)) {
				updatedBody = body.replace(firstHeadingRegex, `${historySection}\n\n$1`);
			} else {
				updatedBody = body.trim() + '\n\n' + historySection;
			}
		}

		return updatedBody;
	}

	static createRecord(
		startPage: number,
		endPage: number,
		notes?: string
	): ReadingRecord {
		const now = getCurrentDateTime();
		const datePart = now.split(' ')[0];
		return {
			date: datePart || now,
			startPage,
			endPage,
			pagesRead: Math.max(0, endPage - startPage),
			notes: notes || undefined,
			timestamp: now,
		};
	}
}
