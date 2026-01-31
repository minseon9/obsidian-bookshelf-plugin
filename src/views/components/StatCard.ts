/**
 * Statistic Card Component
 * Displays a single statistic with label and value
 */
export class StatCard {
	/**
	 * Create a stat card element
	 */
	static create(
		doc: Document,
		label: string,
		value: string | number,
		color: string
	): HTMLElement {
		const cardEl = doc.createElement('div');
		cardEl.setCssProps({
			padding: "20px",
			"border-radius": "8px",
			background: "var(--background-secondary)",
			border: "1px solid var(--background-modifier-border)"
		});

		const labelEl = doc.createElement('div');
		labelEl.textContent = label;
		labelEl.setCssProps({
			"font-size": "12px",
			color: "var(--text-muted)",
			"margin-bottom": "8px"
		});

		const valueEl = doc.createElement('div');
		valueEl.textContent = value.toString();
		valueEl.setCssProps({
			"font-size": "28px",
			"font-weight": "600",
			color: color
		});

		cardEl.appendChild(labelEl);
		cardEl.appendChild(valueEl);

		return cardEl;
	}

	/**
	 * Create a detailed stat card with description
	 */
	static createDetailed(
		doc: Document,
		title: string,
		description: string,
		value: string | number,
		color: string
	): HTMLElement {
		const cardEl = doc.createElement('div');
		cardEl.setCssProps({
			padding: "20px",
			"border-radius": "8px",
			background: "var(--background-secondary)",
			border: "1px solid var(--background-modifier-border)"
		});

		const titleEl = doc.createElement('div');
		titleEl.textContent = title;
		titleEl.setCssProps({
			"font-size": "12px",
			color: "var(--text-muted)",
			"margin-bottom": "4px"
		});

		const descEl = doc.createElement('div');
		descEl.textContent = description;
		descEl.setCssProps({
			"font-size": "10px",
			color: "var(--text-faint)",
			"margin-bottom": "8px"
		});

		const valueEl = doc.createElement('div');
		valueEl.textContent = value.toString();
		valueEl.setCssProps({
			"font-size": "28px",
			"font-weight": "600",
			color: color
		});

		cardEl.appendChild(titleEl);
		cardEl.appendChild(descEl);
		cardEl.appendChild(valueEl);

		return cardEl;
	}
}
