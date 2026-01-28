import * as yaml from 'js-yaml';

export class FrontmatterParser {
	static parse(content: string): Record<string, any> {
		const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
		const match = content.match(frontmatterRegex);

		if (!match || !match[1]) {
			return {};
		}

		const frontmatterText = match[1];

		try {
			const parsed = yaml.load(frontmatterText, { schema: yaml.DEFAULT_SCHEMA }) as Record<string, any> | null;
			if (!parsed || typeof parsed !== 'object') {
				return {};
			}

			const frontmatter: Record<string, any> = {};
			for (const [key, value] of Object.entries(parsed)) {
				if (key === 'reading_history') continue;

				if (key === 'reading_history_summary') {
					frontmatter[key] = FrontmatterParser.normalizeReadingHistorySummary(value);
					continue;
				}

				if (value === '') {
					if (key === 'title' || key === 'author' || key === 'status') {
						frontmatter[key] = value;
					}
					continue;
				}

				frontmatter[key] = value;
			}

			return frontmatter;
		} catch (error) {
			console.error('[FrontmatterParser] Error parsing YAML:', error);
			return {};
		}
	}

	static extract(content: string): { frontmatter: Record<string, any>; body: string } {
		const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
		const match = content.match(frontmatterRegex);

		if (!match) {
			return { frontmatter: {}, body: content };
		}

		const frontmatter = FrontmatterParser.parse(content);
		const body = content.substring(match[0].length);

		return { frontmatter, body };
	}

	private static normalizeReadingHistorySummary(value: any): any[] {
		if (value === null || value === undefined || value === '') {
			return [];
		}
		if (Array.isArray(value)) {
			return value.filter((item: any) => item && typeof item === 'object' && !Array.isArray(item));
		}
		return [];
	}
}
