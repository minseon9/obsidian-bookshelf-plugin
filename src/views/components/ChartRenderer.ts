/**
 * Chart Renderer Component
 * Renders bar and line charts for statistics visualization
 */

interface ChartDataPoint {
	label: string;
	value: number;
}

export class ChartRenderer {
	/**
	 * Render a bar chart
	 */
	static renderBarChart(
		container: HTMLElement,
		doc: Document,
		data: ChartDataPoint[]
	): void {
		if (data.length === 0) {
			this.renderEmptyChart(container, doc, 'Category');
			return;
		}

		const maxValue = Math.max(...data.map(d => d.value));

		data.forEach(item => {
			const barContainer = doc.createElement('div');
			barContainer.setCssProps({
				"margin-bottom": "12px"
			});

			// Label and value row
			const labelRow = doc.createElement('div');
			labelRow.setCssProps({
				display: "flex",
				"justify-content": "space-between",
				"align-items": "center",
				"margin-bottom": "4px"
			});

			const label = doc.createElement('span');
			label.textContent = item.label;
			label.setCssProps({
				"font-size": "12px",
				color: "var(--text-normal)"
			});

			const value = doc.createElement('span');
			value.textContent = item.value.toString();
			value.setCssProps({
				"font-size": "12px",
				"font-weight": "600",
				color: "var(--text-accent)"
			});

			labelRow.appendChild(label);
			labelRow.appendChild(value);

			// Bar background
			const barBg = doc.createElement('div');
			barBg.setCssProps({
				width: "100%",
				height: "8px",
				"background-color": "var(--background-modifier-border)",
				"border-radius": "4px",
				overflow: "hidden"
			});

			// Bar fill
			const barFill = doc.createElement('div');
			const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
			barFill.setCssProps({
				width: `${percentage}%`,
				height: "100%",
				"background-color": "var(--interactive-accent)",
				transition: "width 0.3s"
			});

			barBg.appendChild(barFill);
			barContainer.appendChild(labelRow);
			barContainer.appendChild(barBg);
			container.appendChild(barContainer);
		});
	}

	/**
	 * Render a line chart
	 */
	static renderLineChart(
		container: HTMLElement,
		doc: Document,
		data: ChartDataPoint[],
		xAxisLabel: string
	): void {
		if (data.length === 0) {
			this.renderEmptyChart(container, doc, xAxisLabel);
			return;
		}

		const maxValue = Math.max(...data.map(d => d.value));
		const chartHeight = 200;
		const padding = 40;

		// SVG container
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', chartHeight.toString());
		svg.setCssProps({
			display: "block"
		});

		// Use fixed coordinate system; viewBox will scale to fit container width
		const points: Array<{ x: number; y: number; label: string; value: number }> = [];
		const viewWidth = 600;
		const stepX = (viewWidth - padding * 2) / Math.max(data.length - 1, 1);

		data.forEach((item, index) => {
			const x = padding + index * stepX;
			const y = maxValue > 0
				? chartHeight - padding - ((item.value / maxValue) * (chartHeight - padding * 2))
				: chartHeight - padding;
			points.push({ x, y, label: item.label, value: item.value });
		});

		// Scale to fit: fixed viewBox, SVG fills container
		svg.setAttribute('viewBox', `0 0 ${viewWidth} ${chartHeight}`);
		svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

		// Draw line
		if (points.length > 1) {
			const pathData = points.map((p, i) =>
				i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
			).join(' ');

			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', pathData);
			path.setAttribute('fill', 'none');
			path.setAttribute('stroke', 'var(--interactive-accent)');
			path.setAttribute('stroke-width', '2');
			svg.appendChild(path);
		}

		// Draw points and labels
		points.forEach((point) => {
			// Point circle
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', point.x.toString());
			circle.setAttribute('cy', point.y.toString());
			circle.setAttribute('r', '4');
			circle.setAttribute('fill', 'var(--interactive-accent)');
			svg.appendChild(circle);

			// X-axis label
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			text.setAttribute('x', point.x.toString());
			text.setAttribute('y', (chartHeight - 10).toString());
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('fill', 'var(--text-muted)');
			text.setAttribute('font-size', '10');
			text.textContent = point.label;
			svg.appendChild(text);

			// Value label
			const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			valueText.setAttribute('x', point.x.toString());
			valueText.setAttribute('y', (point.y - 10).toString());
			valueText.setAttribute('text-anchor', 'middle');
			valueText.setAttribute('fill', 'var(--text-normal)');
			valueText.setAttribute('font-size', '10');
			valueText.setAttribute('font-weight', '600');
			valueText.textContent = point.value.toString();
			svg.appendChild(valueText);
		});

		container.appendChild(svg);
	}

	/**
	 * Render empty chart placeholder
	 */
	static renderEmptyChart(
		container: HTMLElement,
		doc: Document,
		xAxisLabel: string
	): void {
		const emptyState = doc.createElement('div');
		emptyState.setCssProps({
			display: "flex",
			"flex-direction": "column",
			"align-items": "center",
			"justify-content": "center",
			height: "200px",
			color: "var(--text-muted)"
		});

		const icon = doc.createElement('div');
		icon.textContent = '📊';
		icon.setCssProps({
			"font-size": "3em",
			"margin-bottom": "8px"
		});

		const text = doc.createElement('div');
		const axisLabel = xAxisLabel.toLowerCase();
		text.textContent = axisLabel ? `No ${axisLabel} data available` : 'No data available';
		text.setCssProps({
			"font-size": "14px"
		});

		emptyState.appendChild(icon);
		emptyState.appendChild(text);
		container.appendChild(emptyState);
	}
}
