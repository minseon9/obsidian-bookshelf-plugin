import { App } from 'obsidian';
import { ProgressUpdateModal } from '../views/progressUpdateModal';
import BookshelfPlugin from '../main';

/**
 * Update progress command
 */
export function registerUpdateProgressCommand(app: App, plugin: BookshelfPlugin): void {
	plugin.addCommand({
		id: 'bookshelf-update-progress',
		name: 'Update reading progress',
		callback: () => {
			const activeFile = app.workspace.getActiveFile();
			if (!activeFile) {
				// Show notice if no file is open
				// For now, just open the modal (it will show an error)
			}
			const modal = new ProgressUpdateModal(app, plugin, activeFile);
			modal.open();
		},
	});
}
