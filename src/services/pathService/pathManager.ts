import { normalizePath } from 'obsidian';

export class PathManager {
	static getBooksFolderPath(baseFolder: string): string {
		return normalizePath(`${baseFolder}/Books`);
	}

	static getInteractionFolderPath(baseFolder: string): string {
		return normalizePath(`${baseFolder}/.bookshelf`);
	}

	static getViewsFolderPath(baseFolder: string): string {
		return normalizePath(`${baseFolder}/Views`);
	}
}
