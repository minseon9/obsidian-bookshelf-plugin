export class FileNameGenerator {
	static generate(title: string): string {
		const sanitized = title
			.replace(/[<>:"/\\|?*]/g, '')
			.replace(/\s+/g, ' ')
			.trim();
		const maxLength = 100;
		const truncated = sanitized.length > maxLength
			? sanitized.substring(0, maxLength).trim()
			: sanitized;
		return truncated || 'Untitled Book';
	}
}
