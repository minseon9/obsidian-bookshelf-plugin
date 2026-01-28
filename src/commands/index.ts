import {App} from 'obsidian';
import BookshelfPlugin from '../main';
import {registerSearchBookCommand} from './searchBook';
import {registerUpdateProgressCommand} from './updateProgress';

/**
 * Register all commands
 */
export function registerCommands(app: App, plugin: BookshelfPlugin): void {
	registerSearchBookCommand(app, plugin);
	registerUpdateProgressCommand(app, plugin);
}
