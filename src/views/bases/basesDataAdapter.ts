import { BasesDataItem } from './basesDataItem';

export class BasesDataAdapter {
	constructor(private basesView: any) {}

	/**
	 * Extract all data items from Bases query result.
	 * Uses public API: basesView.data.data
	 *
	 * NOTE: This only extracts frontmatter and basic file properties (cheap).
	 * Computed file properties (backlinks, links, etc.) are fetched lazily
	 * via getComputedProperty() during rendering for visible items only.
	 */
	extractDataItems(): BasesDataItem[] {
		if (!this.basesView?.data?.data) {
			console.warn("[Bookshelf][BasesDataAdapter] No data available in basesView.data.data");
			return [];
		}
		
		const entries = this.basesView.data.data;
		console.log(`[Bookshelf][BasesDataAdapter] Extracting ${entries.length} entries`);
		
		return entries.map((entry: any) => {
			if (!entry?.file?.path) {
				console.warn("[Bookshelf][BasesDataAdapter] Entry missing file.path:", entry);
				return null;
			}
			
			return {
				key: entry.file.path,
				data: entry,
				file: entry.file,
				path: entry.file.path,
				properties: this.extractEntryProperties(entry),
				basesData: entry,
			};
		}).filter((item: BasesDataItem | null): item is BasesDataItem => item !== null);
	}

	/**
	 * Get grouped data from Bases.
	 * Uses public API: basesView.data.groupedData
	 *
	 * Note: Returns pre-grouped data. Bases has already applied groupBy configuration.
	 */
	getGroupedData(): any[] {
		return this.basesView.data.groupedData;
	}

	/**
	 * Check if data is actually grouped (not just wrapped in single group).
	 *
	 * Note: When groupBy is configured but all items have the same value (or all null),
	 * groupedData will have length 1. We need to check hasKey() to distinguish between:
	 * - No groupBy configured: single group with no key (hasKey() = false)
	 * - GroupBy configured, all null: single group with NullValue key (hasKey() = false)
	 * - GroupBy configured, all same value: single group with value key (hasKey() = true)
	 */
	isGrouped(): boolean {
		const groups = this.basesView.data.groupedData;
		if (groups.length !== 1) return true;

		const singleGroup = groups[0];
		return singleGroup.hasKey(); // False if key is null/undefined
	}

	/**
	 * Get sort configuration.
	 * Uses public API: basesView.config.getSort()
	 *
	 * Note: Data from basesView.data is already pre-sorted.
	 * This is only needed for custom sorting logic.
	 */
	getSortConfig() {
		return this.basesView.config.getSort();
	}

	/**
	 * Get visible property IDs.
	 * Uses public API: basesView.config.getOrder()
	 */
	getVisiblePropertyIds(): string[] {
		return this.basesView.config.getOrder();
	}

	/**
	 * Get display name for a property.
	 * Uses public API: basesView.config.getDisplayName()
	 */
	getPropertyDisplayName(propertyId: string): string {
		return this.basesView.config.getDisplayName(propertyId);
	}

	/**
	 * Get property value from a Bases entry.
	 * Uses public API: entry.getValue()
	 */
	getPropertyValue(entry: any, propertyId: string): any {
		try {
			const value = entry.getValue(propertyId);
			return this.convertValueToNative(value);
		} catch (e) {
			console.warn(`[BasesDataAdapter] Failed to get property ${propertyId}:`, e);
			return null;
		}
	}

	/**
	 * Extract properties from a Bases entry
	 */
	private extractEntryProperties(entry: any): Record<string, any> {
		const properties: Record<string, any> = {};
		
		// Extract note properties (frontmatter)
		if (entry.note) {
			Object.assign(properties, entry.note);
		}
		
		// Extract file properties
		if (entry.file) {
			properties['file.name'] = entry.file.name;
			properties['file.path'] = entry.file.path;
			properties['file.ctime'] = entry.file.ctime;
			properties['file.mtime'] = entry.file.mtime;
		}
		
		return properties;
	}

	/**
	 * Convert Bases value to native JavaScript value
	 */
	private convertValueToNative(value: any): any {
		if (value === null || value === undefined) {
			return null;
		}
		
		// Handle Bases-specific value types
		if (typeof value === 'object' && value.constructor) {
			const constructorName = value.constructor.name;
			
			// Date objects
			if (constructorName === 'Date' || value instanceof Date) {
				return value;
			}
			
			// Array-like objects
			if (Array.isArray(value)) {
				return value.map(v => this.convertValueToNative(v));
			}
		}
		
		return value;
	}
}

