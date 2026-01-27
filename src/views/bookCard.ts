import { App, TFile } from 'obsidian';
import { Book, BookStatus } from '../models/book';
import BookshelfPlugin from '../main';
import { ProgressUpdateModal } from './progressModal';

/**
 * Book card component for rendering book items in Bookshelf View
 */
export class BookCard {
	private app: App;
	private book: Book;
	private file: TFile | null;
	private plugin: BookshelfPlugin | null;

	constructor(app: App, book: Book, file: TFile | null = null, plugin?: BookshelfPlugin) {
		this.app = app;
		this.book = book;
		this.file = file;
		this.plugin = plugin || null;
	}

	/**
	 * Render book card based on status
	 * @param layout Layout type ('grid' | 'list')
	 * @returns HTMLElement
	 */
	render(layout: 'grid' | 'list' = 'grid'): HTMLElement {
		if (this.book.status === 'reading') {
			return this.renderReadingBook(layout);
		} else {
			return this.renderShelfBook(layout);
		}
	}

	/**
	 * Render reading book with cover image
	 */
	private renderReadingBook(layout: 'grid' | 'list'): HTMLElement {
		const card = document.createElement('div');
		card.className = `bookshelf-book-card bookshelf-book-reading bookshelf-layout-${layout}`;

		// Cover image
		if (this.book.coverUrl || this.book.localCover) {
			const coverContainer = card.createEl('div', {
				cls: 'bookshelf-book-cover',
			});

			const coverImg = coverContainer.createEl('img', {
				attr: {
					src: this.book.localCover || this.book.coverUrl || '',
					alt: this.book.title || 'Book cover',
				},
			});

			coverImg.addEventListener('error', () => {
				coverImg.style.display = 'none';
			});
		}

		// Book info
		const infoContainer = card.createEl('div', {
			cls: 'bookshelf-book-info',
		});

		infoContainer.createEl('div', {
			cls: 'bookshelf-book-title',
			text: this.book.title,
		});

		if (this.book.author && this.book.author.length > 0) {
			infoContainer.createEl('div', {
				cls: 'bookshelf-book-author',
				text: this.book.author.join(', '),
			});
		}

		// Progress bar
		if (this.book.totalPages && this.book.readPage !== undefined) {
			const progress = Math.min((this.book.readPage / this.book.totalPages) * 100, 100);
			const progressContainer = infoContainer.createEl('div', {
				cls: 'bookshelf-progress-container',
			});

			const progressBar = progressContainer.createEl('div', {
				cls: 'bookshelf-progress-bar',
			});

			const progressFill = progressContainer.createEl('div', {
				cls: 'bookshelf-progress-fill',
			});
			progressFill.style.width = `${progress}%`;

			progressBar.appendChild(progressFill);

			progressContainer.createEl('div', {
				cls: 'bookshelf-progress-text',
				text: `${this.book.readPage} / ${this.book.totalPages} (${Math.round(progress)}%)`,
			});
		}

		// Update progress button (for reading books)
		if (this.plugin && this.file) {
			const buttonContainer = infoContainer.createEl('div', {
				cls: 'bookshelf-card-actions',
			});

			const updateButton = buttonContainer.createEl('button', {
				cls: 'mod-cta',
				text: 'Update Progress',
			});

			updateButton.addEventListener('click', (e) => {
				e.stopPropagation(); // Prevent card click
				const modal = new ProgressUpdateModal(this.app, this.plugin!, this.file!);
				modal.open();
			});
		}

		// Click handler (for opening note)
		if (this.file) {
			card.addEventListener('click', (e) => {
				// Don't open if clicking on button
				if ((e.target as HTMLElement).closest('button')) {
					return;
				}
				this.app.workspace.openLinkText(this.file!.path, '', false);
			});
			card.style.cursor = 'pointer';
		}

		return card;
	}

	/**
	 * Render shelf book (unread/finished) with spine style
	 */
	private renderShelfBook(layout: 'grid' | 'list'): HTMLElement {
		const card = document.createElement('div');
		card.className = `bookshelf-book-card bookshelf-book-shelf bookshelf-status-${this.book.status} bookshelf-layout-${layout}`;

		// Spine container
		const spineContainer = card.createEl('div', {
			cls: 'bookshelf-book-spine',
		});

		// Title on spine
		spineContainer.createEl('div', {
			cls: 'bookshelf-spine-title',
			text: this.book.title,
		});

		// Author on spine
		if (this.book.author && this.book.author.length > 0) {
			spineContainer.createEl('div', {
				cls: 'bookshelf-spine-author',
				text: this.book.author.join(', '),
			});
		}

		// Status badge
		const statusBadge = spineContainer.createEl('div', {
			cls: 'bookshelf-status-badge',
			text: this.book.status === 'finished' ? 'Finished' : 'Unread',
		});

		// Finished date
		if (this.book.status === 'finished' && this.book.readFinished) {
			spineContainer.createEl('div', {
				cls: 'bookshelf-spine-meta',
				text: `Finished: ${this.book.readFinished.split(' ')[0]}`,
			});
		}

		// Click handler
		if (this.file) {
			card.addEventListener('click', () => {
				this.app.workspace.openLinkText(this.file!.path, '', false);
			});
			card.style.cursor = 'pointer';
		}

		return card;
	}
}
