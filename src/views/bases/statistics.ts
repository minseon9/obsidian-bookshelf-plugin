import { TFile } from 'obsidian';
import { Book } from '../../models/book';
import { BasesViewBase } from './base';
import BookshelfPlugin from '../../main';
import { StatCard } from '../components/StatCard';
import { SectionHeader } from '../components/SectionHeader';
import { ChartRenderer } from '../components/ChartRenderer';
import { ChartPanel } from '../components/ChartPanel';
import { ToggleButtonGroup } from '../components/ToggleButtonGroup';
import { DetailsListRow } from '../components/DetailsListRow';

/**
 * Book statistics interface
 * Note: This is a view-specific aggregation interface, not a domain model
 */
interface BookStatistics {
	totalBooks: number;
	reading: number;
	unread: number;
	finished: number;
	totalPages: number;
	readPages: number;
	totalReadingDays: number;
	averageTimeToFinish: number;
	categoryCounts: Record<string, number>;
	yearlyStats: Record<string, { 
		count: number; 
		pages: number; 
		readingDays: number; 
		averageTimeToFinish: number;
		change?: number; 
		changePercent?: number;
	}>;
	monthlyStats: Record<string, { 
		count: number; 
		pages: number; 
		readingDays: number; 
		averageTimeToFinish: number;
		change?: number; 
		changePercent?: number;
	}>;
}

/**
 * Statistics View - Displays reading statistics and graphs
 */
export class StatisticsBasesView extends BasesViewBase {
	type = "bookshelfStatisticsView";

	private books: Array<{ book: Book; file: TFile }> = [];
	private stats: BookStatistics | null = null;

	constructor(controller: unknown, containerEl: HTMLElement, plugin: BookshelfPlugin) {
		super(controller, containerEl, plugin);
	}

	async render(): Promise<void> {
		if (!this.rootElement || !this.data?.data) return;

		try {
			const dataItems = this.extractDataItems();
			this.books = await this.extractBooksFromBasesData(dataItems);
			this.stats = await this.calculateStatistics();

			this.rootElement.empty();
			this.renderContent();
		} catch (error) {
			console.error('[Bookshelf][StatisticsView] Render error:', error);
			this.renderError(error as Error);
		}
	}

	private async calculateStatistics(): Promise<BookStatistics> {
		const stats: BookStatistics = {
			totalBooks: this.books.length,
			reading: 0,
			unread: 0,
			finished: 0,
			totalPages: 0,
			readPages: 0,
			totalReadingDays: 0,
			averageTimeToFinish: 0,
			categoryCounts: {},
			yearlyStats: {},
			monthlyStats: {},
		};

		const finishedBooks: Book[] = [];
		const readingDaysSet = new Set<string>();

		for (const { book, file } of this.books) {
			// Count by status
			if (book.status === 'reading') stats.reading++;
			else if (book.status === 'unread') stats.unread++;
			else if (book.status === 'finished') {
				stats.finished++;
				finishedBooks.push(book);
			}

			// Pages
			if (book.totalPages) stats.totalPages += book.totalPages;
			if (book.readPage) stats.readPages += book.readPage;

			// Categories (only count finished books)
			if (book.status === 'finished' && book.category && book.category.length > 0) {
				book.category.forEach((cat: string) => {
					stats.categoryCounts[cat] = (stats.categoryCounts[cat] || 0) + 1;
				});
			}

			// Finished books statistics
			if (book.status === 'finished' && book.readFinished) {
				const finishedDate = new Date(book.readFinished);
				const year = finishedDate.getFullYear().toString();
				const month = `${year}-${String(finishedDate.getMonth() + 1).padStart(2, '0')}`;

				if (!stats.yearlyStats[year]) {
					stats.yearlyStats[year] = { count: 0, pages: 0, readingDays: 0, averageTimeToFinish: 0 };
				}
				stats.yearlyStats[year].count++;
				if (book.totalPages) {
					stats.yearlyStats[year].pages += book.totalPages;
				}

				if (!stats.monthlyStats[month]) {
					stats.monthlyStats[month] = { count: 0, pages: 0, readingDays: 0, averageTimeToFinish: 0 };
				}
				stats.monthlyStats[month].count++;
				if (book.totalPages) {
					stats.monthlyStats[month].pages += book.totalPages;
				}

				// Calculate reading days and average time to finish for this book
				const bookReadingDaysSet = new Set<string>();
				if (book.readStarted) {
					const startDate = new Date(book.readStarted);
					const startDateStr = startDate.toISOString().split('T')[0];
					if (startDateStr) bookReadingDaysSet.add(startDateStr);
				}

				// Get reading history summary for this book
				try {
					const content = await this.plugin.app.vault.read(file);
					const { FrontmatterParser } = await import('../../services/frontmatterService/frontmatterParser');
					const { frontmatter } = FrontmatterParser.extract(content);
					
					const historySummary = frontmatter.reading_history_summary;
					if (historySummary && Array.isArray(historySummary)) {
						historySummary.forEach((record: unknown) => {
							if (record && typeof record === 'object' && 'date' in record && typeof record.date === 'string') {
								bookReadingDaysSet.add(record.date);
							}
						});
					}
			} catch {
				// Ignore errors
			}

				const bookReadingDays = bookReadingDaysSet.size;
				stats.yearlyStats[year].readingDays += bookReadingDays;
				stats.yearlyStats[year].averageTimeToFinish += bookReadingDays;
				stats.monthlyStats[month].readingDays += bookReadingDays;
				stats.monthlyStats[month].averageTimeToFinish += bookReadingDays;
			}

			// Reading days calculation: only days with update progress (from reading_history_summary)
			// and the day reading started
			if (book.readStarted && file) {
				// Add the day reading started
				const startDate = new Date(book.readStarted);
				const startDateStr = startDate.toISOString().split('T')[0];
				if (startDateStr) {
					readingDaysSet.add(startDateStr);
				}

				// Add days from reading_history_summary (update progress days)
				// Get reading history summary from file
				try {
					const content = await this.plugin.app.vault.read(file);
					const { FrontmatterParser } = await import('../../services/frontmatterService/frontmatterParser');
					const { frontmatter } = FrontmatterParser.extract(content);
					
					const historySummary = frontmatter.reading_history_summary;
					if (historySummary && Array.isArray(historySummary)) {
						historySummary.forEach((record: unknown) => {
							if (record && typeof record === 'object' && 'date' in record && typeof record.date === 'string') {
								readingDaysSet.add(record.date);
							}
						});
					}
			} catch {
				// Ignore errors
			}
			}
		}

		stats.totalReadingDays = readingDaysSet.size;

		// Calculate average time to finish per period and changes
		const sortedYears = Object.keys(stats.yearlyStats).sort();
		for (let i = 0; i < sortedYears.length; i++) {
			const year = sortedYears[i];
			if (!year) continue;
			
			const current = stats.yearlyStats[year];
			if (!current) continue;
			
			if (current.count > 0) {
				current.averageTimeToFinish = Math.round(current.averageTimeToFinish / current.count);
			}
			
			// Calculate change from previous year
			if (i > 0) {
				const previousYear = sortedYears[i - 1];
				const previous = previousYear ? stats.yearlyStats[previousYear] : null;
				
				if (previous) {
					current.change = current.count - previous.count;
					current.changePercent = previous.count > 0 
						? Math.round((current.change / previous.count) * 100) 
						: (current.count > 0 ? 100 : 0);
				}
			}
		}

		// Calculate average time to finish per period and changes for monthly stats
		const sortedMonths = Object.keys(stats.monthlyStats).sort();
		for (let i = 0; i < sortedMonths.length; i++) {
			const month = sortedMonths[i];
			if (!month) continue;
			
			const current = stats.monthlyStats[month];
			if (!current) continue;
			
			if (current.count > 0) {
				current.averageTimeToFinish = Math.round(current.averageTimeToFinish / current.count);
			}
			
			// Calculate change from previous month
			if (i > 0) {
				const previousMonth = sortedMonths[i - 1];
				const previous = previousMonth ? stats.monthlyStats[previousMonth] : null;
				
				if (previous) {
					current.change = current.count - previous.count;
					current.changePercent = previous.count > 0 
						? Math.round((current.change / previous.count) * 100) 
						: (current.count > 0 ? 100 : 0);
				}
			}
		}

		// Average days to finish (based on number of update sessions)
		if (finishedBooks.length > 0) {
			let totalUpdateDays = 0;
			let count = 0;
			
			for (const bookItem of this.books) {
				if (bookItem.book.status !== 'finished') continue;
				
				try {
					const content = await this.plugin.app.vault.read(bookItem.file);
					const { FrontmatterParser } = await import('../../services/frontmatterService/frontmatterParser');
					const { frontmatter } = FrontmatterParser.extract(content);
					
					// Count unique update days from reading_history_summary
					const historySummary = frontmatter.reading_history_summary;
					const updateDaysSet = new Set<string>();
					
					// Add start day
					if (bookItem.book.readStarted) {
						const startDate = new Date(bookItem.book.readStarted);
						const startDateStr = startDate.toISOString().split('T')[0];
						if (startDateStr) {
							updateDaysSet.add(startDateStr);
						}
					}
					
					// Add update days from history
					if (historySummary && Array.isArray(historySummary)) {
						historySummary.forEach((record: unknown) => {
							if (record && typeof record === 'object' && 'date' in record && typeof record.date === 'string') {
								updateDaysSet.add(record.date);
							}
						});
					}
					
					const updateDays = updateDaysSet.size;
					if (updateDays > 0) {
						totalUpdateDays += updateDays;
						count++;
					}
			} catch {
				// Ignore errors
			}
			}
			
			stats.averageTimeToFinish = count > 0 ? Math.round(totalUpdateDays / count) : 0;
		}

		return stats;
	}

private renderContent(): void {
	if (!this.rootElement || !this.stats) return;

	const doc = this.rootElement.ownerDocument;
	const container = doc.createElement('div');
	container.setCssProps({
		padding: "20px",
		"overflow-y": "auto",
		height: "100%"
	});

	// Title
	const title = doc.createElement('h1');
	title.textContent = 'Reading statistics';
	title.setCssProps({
		margin: "0 0 32px 0",
		"font-size": "1.8em"
	});
	container.appendChild(title);

	// Section 1: Overall Statistics
	this.renderOverallSection(container, doc);

	// Section 2: Yearly/Monthly Statistics
	this.renderTimeBasedSection(container, doc);

	// Section 3: Category Statistics
	this.renderCategorySection(container, doc);

	this.rootElement.appendChild(container);
}

private renderOverallSection(container: HTMLElement, doc: Document): void {
	const section = doc.createElement('div');
	section.setCssProps({ "margin-bottom": "40px" });

	// Section header
	const header = SectionHeader.create(doc, 'Overall Statistics');
	section.appendChild(header);

	// Grid: 3 cards in a row
	const cardsGrid = doc.createElement('div');
	cardsGrid.setCssProps({
		display: "grid",
		"grid-template-columns": "repeat(auto-fit, minmax(250px, 1fr))",
		gap: "16px",
		"margin-bottom": "16px"
	});

	const cards = [
		{ label: 'Total Finished Books', value: this.stats!.finished, color: 'var(--interactive-success)' },
		{ label: 'Total Pages Read', value: this.stats!.readPages.toLocaleString(), color: 'var(--interactive-accent)' },
		{ label: 'Total Reading Days', value: this.stats!.totalReadingDays, color: 'var(--text-accent)' },
	];

	cards.forEach(card => {
		const cardEl = StatCard.create(doc, card.label, card.value, card.color);
		cardsGrid.appendChild(cardEl);
	});

	section.appendChild(cardsGrid);

	// Average time card (below)
	const avgValue = this.stats!.averageTimeToFinish > 0 
		? `${this.stats!.averageTimeToFinish} sessions`
		: 'No data available';
	
	const avgTimeEl = StatCard.createDetailed(
		doc,
		'Average Days to Finish',
		'Average number of reading sessions to complete a book',
		avgValue,
		'var(--interactive-accent)'
	);
	section.appendChild(avgTimeEl);

	container.appendChild(section);
}

	private renderTimeBasedSection(container: HTMLElement, doc: Document): void {
		const section = doc.createElement('div');
		section.setCssProps({ "margin-bottom": "40px" });

		// Section header with toggle
		const headerContainer = doc.createElement('div');
		headerContainer.setCssProps({
			display: "flex",
			"justify-content": "space-between",
			"align-items": "center",
			"margin-bottom": "16px",
			"padding-bottom": "8px",
			"border-bottom": "2px solid var(--background-modifier-border)"
		});

		const header = doc.createElement('h2');
		header.textContent = 'Time-based statistics';
		header.setCssProps({
			margin: "0",
			"font-size": "1.4em"
		});
		headerContainer.appendChild(header);

		const { container: toggleContainer, yearButton, monthButton, setActive } = ToggleButtonGroup.create(doc, 'Yearly', 'Monthly');
		headerContainer.appendChild(toggleContainer);
		section.appendChild(headerContainer);

		// Content container
		const contentContainer = doc.createElement('div');
		contentContainer.setCssProps({ position: "relative" });

		this.renderYearlyContent(contentContainer, doc);

		yearButton.addEventListener('click', () => {
			setActive('year');
			contentContainer.empty();
			this.renderYearlyContent(contentContainer, doc);
		});

		monthButton.addEventListener('click', () => {
			setActive('month');
			contentContainer.empty();
			this.renderMonthlyContent(contentContainer, doc);
		});

		section.appendChild(contentContainer);
		container.appendChild(section);
	}

	private renderYearlyContent(container: HTMLElement, doc: Document): void {
		const years = Object.keys(this.stats!.yearlyStats).sort().reverse();
		const chartsGrid = doc.createElement('div');
		chartsGrid.setCssProps({
			display: "grid",
			"grid-template-columns": "repeat(auto-fit, minmax(300px, 1fr))",
			gap: "16px",
			"margin-bottom": "16px"
		});

		const emptyTitles = ['Finished Books', 'Pages Read', 'Reading Days'];

		if (years.length === 0) {
			emptyTitles.forEach(title => {
				const { container: panelContainer, chartEl } = ChartPanel.create(doc, title);
				ChartRenderer.renderEmptyChart(chartEl, doc, 'Year');
				chartsGrid.appendChild(panelContainer);
			});
			container.appendChild(chartsGrid);
			return;
		}

		// Finished books chart
		const booksPanel = ChartPanel.create(doc, 'Finished Books');
		this.renderLineChart(booksPanel.chartEl, doc, years.map(year => {
			const stat = this.stats!.yearlyStats[year];
			return {
				label: year,
				value: stat ? stat.count : 0,
				change: stat?.change,
				changePercent: stat?.changePercent,
			};
		}), 'Year');
		chartsGrid.appendChild(booksPanel.container);

		// Pages read chart
		const pagesPanel = ChartPanel.create(doc, 'Pages Read');
		this.renderLineChart(pagesPanel.chartEl, doc, years.map(year => {
			const stat = this.stats!.yearlyStats[year];
			return { label: year, value: stat ? stat.pages : 0 };
		}), 'Year');
		chartsGrid.appendChild(pagesPanel.container);

		// Reading days chart
		const daysPanel = ChartPanel.create(doc, 'Reading Days');
		this.renderLineChart(daysPanel.chartEl, doc, years.map(year => {
			const stat = this.stats!.yearlyStats[year];
			return { label: year, value: stat ? stat.readingDays : 0 };
		}), 'Year');
		chartsGrid.appendChild(daysPanel.container);

		container.appendChild(chartsGrid);

		// Details list
		const { container: listContainer, listEl } = ChartPanel.createDetailsPanel(doc, 'Details');
		years.forEach(year => {
			const stat = this.stats!.yearlyStats[year];
			if (!stat) return;
			const changeText = stat.change !== undefined && stat.changePercent !== undefined
				? `${stat.change >= 0 ? '+' : ''}${stat.change} (${stat.changePercent !== undefined ? (stat.change >= 0 ? '+' : '') + stat.changePercent + '%' : ''})`
				: undefined;
			const changeColor = stat.change !== undefined && stat.change >= 0 ? 'var(--interactive-success)' : 'var(--text-error)';
			const row = DetailsListRow.create(doc, {
				label: year,
				changeText,
				changeColor,
				rightPrimary: `${stat.count} books, ${stat.pages.toLocaleString()} pages`,
				rightSecondary: `${stat.readingDays} reading days, Avg: ${stat.averageTimeToFinish} sessions`
			});
			listEl.appendChild(row);
		});
		container.appendChild(listContainer);
	}

	private monthLabel(monthKey: string): string {
		const parts = monthKey.split('-');
		const year = parts[0] || '';
		const monthNum = parts[1] || '1';
		const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${monthNames[parseInt(monthNum, 10) - 1] || 'Jan'} ${year}`;
	}

	private renderMonthlyContent(container: HTMLElement, doc: Document): void {
		const months = Object.keys(this.stats!.monthlyStats).sort().reverse().slice(0, 12);
		const chartsGrid = doc.createElement('div');
		chartsGrid.setCssProps({
			display: "grid",
			"grid-template-columns": "repeat(auto-fit, minmax(300px, 1fr))",
			gap: "16px",
			"margin-bottom": "16px"
		});

		const emptyTitles = ['Finished Books (Last 12)', 'Pages Read (Last 12)', 'Reading Days (Last 12)'];

		if (months.length === 0) {
			emptyTitles.forEach(title => {
				const { container: panelContainer, chartEl } = ChartPanel.create(doc, title);
				ChartRenderer.renderEmptyChart(chartEl, doc, 'Month');
				chartsGrid.appendChild(panelContainer);
			});
			container.appendChild(chartsGrid);
			return;
		}

		const booksPanel = ChartPanel.create(doc, 'Finished Books (Last 12)');
		this.renderLineChart(booksPanel.chartEl, doc, months.map(month => {
			const stat = this.stats!.monthlyStats[month];
			return {
				label: this.monthLabel(month),
				value: stat ? stat.count : 0,
				change: stat?.change,
				changePercent: stat?.changePercent,
			};
		}), 'Month');
		chartsGrid.appendChild(booksPanel.container);

		const pagesPanel = ChartPanel.create(doc, 'Pages Read (Last 12)');
		this.renderLineChart(pagesPanel.chartEl, doc, months.map(month => {
			const stat = this.stats!.monthlyStats[month];
			return { label: this.monthLabel(month), value: stat ? stat.pages : 0 };
		}), 'Month');
		chartsGrid.appendChild(pagesPanel.container);

		const daysPanel = ChartPanel.create(doc, 'Reading Days (Last 12)');
		this.renderLineChart(daysPanel.chartEl, doc, months.map(month => {
			const stat = this.stats!.monthlyStats[month];
			return { label: this.monthLabel(month), value: stat ? stat.readingDays : 0 };
		}), 'Month');
		chartsGrid.appendChild(daysPanel.container);

		container.appendChild(chartsGrid);

		const { container: listContainer, listEl } = ChartPanel.createDetailsPanel(doc, 'Details');
		months.forEach(month => {
			const stat = this.stats!.monthlyStats[month];
			if (!stat) return;
			const monthLabelStr = this.monthLabel(month);
			const changeText = stat.change !== undefined && stat.changePercent !== undefined
				? `${stat.change >= 0 ? '+' : ''}${stat.change} (${stat.changePercent !== undefined ? (stat.change >= 0 ? '+' : '') + stat.changePercent + '%' : ''})`
				: undefined;
			const changeColor = stat.change !== undefined && stat.change >= 0 ? 'var(--interactive-success)' : 'var(--text-error)';
			const row = DetailsListRow.create(doc, {
				label: monthLabelStr,
				changeText,
				changeColor,
				rightPrimary: `${stat.count} books, ${stat.pages.toLocaleString()} pages`,
				rightSecondary: `${stat.readingDays} reading days, Avg: ${stat.averageTimeToFinish} sessions`
			});
			listEl.appendChild(row);
		});
		container.appendChild(listContainer);
	}

	private renderCategorySection(container: HTMLElement, doc: Document): void {
		const section = doc.createElement('div');
		section.setCssProps({ "margin-bottom": "40px" });

		const header = SectionHeader.create(doc, 'Category Statistics');
		section.appendChild(header);

		const categories = Object.entries(this.stats!.categoryCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10);

		const chartPanel = ChartPanel.create(doc, 'Books by Category (Top 10)');
		chartPanel.container.setCssProps({ "max-width": "600px" });

		if (categories.length === 0) {
			ChartRenderer.renderEmptyChart(chartPanel.chartEl, doc, 'Category');
		} else {
			ChartRenderer.renderBarChart(chartPanel.chartEl, doc, categories.map(([category, count]) => ({
				label: category,
				value: count,
			})));
		}

		section.appendChild(chartPanel.container);
		container.appendChild(section);
	}

	/**
	 * Render a line chart showing variation over time
	 */
	private renderLineChart(
		container: HTMLElement, 
		doc: Document, 
		data: Array<{ label: string; value: number; change?: number; changePercent?: number }>,
		xAxisLabel: string
	): void {
		if (data.length === 0) return;

		// Reverse data to show chronological order (oldest to newest)
		const reversedData = [...data].reverse();
		const maxValue = Math.max(...reversedData.map(d => d.value), 1);
		const chartHeight = 200;
		const viewWidth = 600;
		const padding = 40;
		const plotWidth = viewWidth - padding * 2;
		const plotHeight = chartHeight - padding * 2;

		const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', `${chartHeight}px`);
		svg.setAttribute('viewBox', `0 0 ${viewWidth} ${chartHeight}`);
		svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
		(svg as unknown as HTMLElement).setCssProps({ display: "block" });

		// Calculate points for line
		const points: string[] = [];
		reversedData.forEach((item, index) => {
			const x = padding + (index / (reversedData.length - 1 || 1)) * plotWidth;
			const y = padding + plotHeight - (item.value / maxValue) * plotHeight;
			points.push(`${x},${y}`);
		});

		// Draw line
		if (points.length > 1) {
			const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', `M ${points.join(' L ')}`);
			path.setAttribute('fill', 'none');
			path.setAttribute('stroke', 'var(--interactive-accent)');
			path.setAttribute('stroke-width', '2');
			path.setAttribute('stroke-linecap', 'round');
			path.setAttribute('stroke-linejoin', 'round');
			svg.appendChild(path);
		}

		// Draw points and change indicators
		reversedData.forEach((item, index) => {
			const x = padding + (index / (reversedData.length - 1 || 1)) * plotWidth;
			const y = padding + plotHeight - (item.value / maxValue) * plotHeight;

			// Point circle
			const circle = doc.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', x.toString());
			circle.setAttribute('cy', y.toString());
			circle.setAttribute('r', '4');
			circle.setAttribute('fill', 'var(--interactive-accent)');
			svg.appendChild(circle);

			// Value label
			if (item.value > 0) {
				const text = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
				text.setAttribute('x', x.toString());
				text.setAttribute('y', (y - 10).toString());
				text.setAttribute('text-anchor', 'middle');
				text.setAttribute('font-size', '11');
				text.setAttribute('fill', 'var(--text-normal)');
				text.setAttribute('font-weight', '600');
				text.textContent = item.value.toString();
				svg.appendChild(text);
			}

			// Change indicator (arrow)
			if (item.change !== undefined && item.change !== 0) {
				const isPositive = item.change > 0;
				const arrowY = y - 20;
				const arrowPath = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
				if (isPositive) {
					// Up arrow
					arrowPath.setAttribute('d', `M ${x} ${arrowY} L ${x - 4} ${arrowY + 6} L ${x + 4} ${arrowY + 6} Z`);
				} else {
					// Down arrow
					arrowPath.setAttribute('d', `M ${x} ${arrowY + 6} L ${x - 4} ${arrowY} L ${x + 4} ${arrowY} Z`);
				}
				arrowPath.setAttribute('fill', isPositive ? 'var(--interactive-success)' : 'var(--text-error)');
				svg.appendChild(arrowPath);
			}

			// X-axis label
			const label = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
			label.setAttribute('x', x.toString());
			label.setAttribute('y', (chartHeight - 10).toString());
			label.setAttribute('text-anchor', 'middle');
			label.setAttribute('font-size', '9');
			label.setAttribute('fill', 'var(--text-muted)');
			label.textContent = item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label;
			svg.appendChild(label);
		});

		// Y-axis (value scale)
		const yAxisSteps = 5;
		for (let i = 0; i <= yAxisSteps; i++) {
			const value = (maxValue / yAxisSteps) * i;
			const y = padding + plotHeight - (i / yAxisSteps) * plotHeight;

			// Grid line
			const gridLine = doc.createElementNS('http://www.w3.org/2000/svg', 'line');
			gridLine.setAttribute('x1', padding.toString());
			gridLine.setAttribute('y1', y.toString());
			gridLine.setAttribute('x2', (padding + plotWidth).toString());
			gridLine.setAttribute('y2', y.toString());
			gridLine.setAttribute('stroke', 'var(--background-modifier-border)');
			gridLine.setAttribute('stroke-width', '1');
			gridLine.setAttribute('stroke-dasharray', '2,2');
			svg.insertBefore(gridLine, svg.firstChild);

			// Y-axis label
			const yLabel = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
			yLabel.setAttribute('x', (padding - 5).toString());
			yLabel.setAttribute('y', (y + 4).toString());
			yLabel.setAttribute('text-anchor', 'end');
			yLabel.setAttribute('font-size', '9');
			yLabel.setAttribute('fill', 'var(--text-muted)');
			yLabel.textContent = Math.round(value).toString();
			svg.insertBefore(yLabel, svg.firstChild);
		}

		container.appendChild(svg);
	}

	/**
	 * Render empty chart with X/Y axes
	 */
	private renderEmptyChart(container: HTMLElement, doc: Document, xAxisLabel: string): void {
		const chartHeight = 200;
		const viewWidth = 600;
		const padding = 40;
		const plotWidth = viewWidth - padding * 2;
		const plotHeight = chartHeight - padding * 2;

		const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', `${chartHeight}px`);
		svg.setAttribute('viewBox', `0 0 ${viewWidth} ${chartHeight}`);
		svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
		(svg as unknown as HTMLElement).setCssProps({ display: "block" });

		// Y-axis (value scale)
		const yAxisSteps = 5;
		for (let i = 0; i <= yAxisSteps; i++) {
			const value = i;
			const y = padding + plotHeight - (i / yAxisSteps) * plotHeight;

			// Grid line
			const gridLine = doc.createElementNS('http://www.w3.org/2000/svg', 'line');
			gridLine.setAttribute('x1', padding.toString());
			gridLine.setAttribute('y1', y.toString());
			gridLine.setAttribute('x2', (padding + plotWidth).toString());
			gridLine.setAttribute('y2', y.toString());
			gridLine.setAttribute('stroke', 'var(--background-modifier-border)');
			gridLine.setAttribute('stroke-width', '1');
			gridLine.setAttribute('stroke-dasharray', '2,2');
			svg.appendChild(gridLine);

			// Y-axis label
			const yLabel = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
			yLabel.setAttribute('x', (padding - 5).toString());
			yLabel.setAttribute('y', (y + 4).toString());
			yLabel.setAttribute('text-anchor', 'end');
			yLabel.setAttribute('font-size', '9');
			yLabel.setAttribute('fill', 'var(--text-muted)');
			yLabel.textContent = value.toString();
			svg.appendChild(yLabel);
		}

		// X-axis line
		const xAxisLine = doc.createElementNS('http://www.w3.org/2000/svg', 'line');
		xAxisLine.setAttribute('x1', padding.toString());
		xAxisLine.setAttribute('y1', (padding + plotHeight).toString());
		xAxisLine.setAttribute('x2', (padding + plotWidth).toString());
		xAxisLine.setAttribute('y2', (padding + plotHeight).toString());
		xAxisLine.setAttribute('stroke', 'var(--text-muted)');
		xAxisLine.setAttribute('stroke-width', '1');
		svg.appendChild(xAxisLine);

		// Y-axis line
		const yAxisLine = doc.createElementNS('http://www.w3.org/2000/svg', 'line');
		yAxisLine.setAttribute('x1', padding.toString());
		yAxisLine.setAttribute('y1', padding.toString());
		yAxisLine.setAttribute('x2', padding.toString());
		yAxisLine.setAttribute('y2', (padding + plotHeight).toString());
		yAxisLine.setAttribute('stroke', 'var(--text-muted)');
		yAxisLine.setAttribute('stroke-width', '1');
		svg.appendChild(yAxisLine);

		// Empty message
		const emptyText = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
		emptyText.setAttribute('x', (padding + plotWidth / 2).toString());
		emptyText.setAttribute('y', (padding + plotHeight / 2).toString());
		emptyText.setAttribute('text-anchor', 'middle');
		emptyText.setAttribute('font-size', '14');
		emptyText.setAttribute('fill', 'var(--text-muted)');
		emptyText.setAttribute('font-style', 'italic');
		emptyText.textContent = 'No data available';
		svg.appendChild(emptyText);

		container.appendChild(svg);
	}
}

