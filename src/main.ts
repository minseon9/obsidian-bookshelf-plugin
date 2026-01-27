import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, BookshelfSettings, BookshelfSettingTab } from "./settings";

export default class BookshelfPlugin extends Plugin {
	settings: BookshelfSettings;

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new BookshelfSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<BookshelfSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
