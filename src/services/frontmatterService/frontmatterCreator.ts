import * as yaml from 'js-yaml';

export class FrontmatterCreator {
	static create(data: Record<string, any>): string {
		const yamlData: Record<string, any> = {};

		for (const [key, value] of Object.entries(data)) {
			if (value === undefined || value === null) continue;
			if (key === 'reading_history') continue;

			if (value === '') {
				if (key === 'title' || key === 'author' || key === 'status') {
					yamlData[key] = value;
				}
				continue;
			}

			if (Array.isArray(value)) {
				if (value.length === 0) {
					if (key === 'reading_history_summary') {
						yamlData[key] = [];
					}
					continue;
				}

				if (key === 'reading_history_summary') {
					const validItems = value.filter((item: any) => 
						item && typeof item === 'object' && !Array.isArray(item)
					);
					yamlData[key] = validItems.length > 0 ? validItems : [];
				} else {
					yamlData[key] = value;
				}
			} else {
				yamlData[key] = value;
			}
		}

		try {
			const yamlString = yaml.dump(yamlData, {
				lineWidth: -1,
				noRefs: true,
				quotingType: '"',
				forceQuotes: false,
				indent: 2,
			});
			return `---\n${yamlString}---`;
		} catch (error) {
			console.error('[FrontmatterCreator] Error creating YAML:', error);
			return '---\n---';
		}
	}
}
