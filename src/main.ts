import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, BookshelfSettings, BookshelfSettingTab } from "./settings";
import { registerCommands } from "./commands";
import { FileManagerUtils } from "./utils/fileManagerUtils";
import { BookshelfView } from "./views/bookshelfView";
import { SearchModal } from "./views/searchModal";

export default class BookshelfPlugin extends Plugin {
	settings: BookshelfSettings;

	async onload() {
		await this.loadSettings();

		// Ensure default folders exist
		const fileManager = new FileManagerUtils(this.app);
		await fileManager.ensureFolder(this.settings.bookFolder);
		await fileManager.ensureFolder(fileManager.getBooksFolderPath(this.settings.bookFolder));
		await fileManager.ensureFolder(fileManager.getInteractionFolderPath(this.settings.bookFolder));

		// Add settings tab
		this.addSettingTab(new BookshelfSettingTab(this.app, this));

		// Register commands
		registerCommands(this.app, this);

		// Register view
		this.registerView('bookshelf-view', (leaf) => new BookshelfView(leaf, this));

		// Add command to open view
		this.addCommand({
			id: 'bookshelf-open-view',
			name: 'Open Bookshelf',
			callback: () => {
				this.activateView();
			},
		});

		// Add Ribbon icons (Left Navigation Bar)
		this.addRibbonIcon('book-open', 'Open Bookshelf', () => {
			this.activateView();
		});

		this.addRibbonIcon('plus-circle', 'Search and Add Book', () => {
			const modal = new SearchModal(this.app, this);
			modal.open();
		});
	}

	async onunload() {
		this.app.workspace.detachLeavesOfType('bookshelf-view');
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType('bookshelf-view')[0];
		if (!leaf) {
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				await rightLeaf.setViewState({ type: 'bookshelf-view', active: true });
				leaf = rightLeaf;
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<BookshelfSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
