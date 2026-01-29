import {Book} from '../models/book';
import {formatDate} from '../utils/dateUtils';

export class TemplateProcessor {

	processTemplate(template: string, book: Book): string {
		const data = this.prepareTemplateData(book);
		return this.replacePlaceholders(template, data);
	}

	getDefaultTemplate(): string {
		return this.getDefaultTemplateContent();
	}

	private prepareTemplateData(book: Book): Record<string, string> {
		return {
			title: book.title || '',
			subtitle: book.subtitle || '',
			author: this.formatAuthorArray(book.author || []),
			category: this.formatArray(book.category || []),
			publisher: book.publisher || '',
			publishDate: book.publishDate || '',
			totalPage: book.totalPages?.toString() || '',
			isbn10: book.isbn10 || '',
			isbn13: book.isbn13 || '',
			coverUrl: book.coverUrl || '',
			page: book.readPage?.toString() || '0',
		};
	}

	private formatAuthorArray(authors: string[]): string {
		if (authors.length === 0) return '';
		return authors.map(a => `"${a}"`).join(', ');
	}

	private formatArray(items: string[]): string {
		if (items.length === 0) return '';
		return items.map(item => `"${item}"`).join(', ');
	}

	private replacePlaceholders(template: string, data: Record<string, string>): string {
		let result = template;
		result = result.replace(/<%[\s\S]*?%>/g, '');
		result = result.replace(/^%%[\s\S]*?%%$/gm, '');
		result = result.replace(/\{\{DATE:([^}]+)\}\}/g, (_match, format: string) => {
			return formatDate(new Date(), format);
		});
		for (const [key, value] of Object.entries(data)) {
			const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
			result = result.replace(placeholder, value);
		}
		result = result.replace(/\n{3,}/g, '\n\n');
		return result.trim();
	}

	private getDefaultTemplateContent(): string {
		return `# {{title}}

%% To use an image URL from the server, use the following syntax: %%
<%* if (tp.frontmatter.cover && tp.frontmatter.cover.trim() !== "") { tR += \`![cover|150](\${tp.frontmatter.cover})\` } %>
`;
	}
}
