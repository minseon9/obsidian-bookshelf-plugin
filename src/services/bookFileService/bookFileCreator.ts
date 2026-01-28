import { App, TFile, normalizePath } from 'obsidian';
import { Book } from '../../models/book';
import { FolderManager } from '../pathService/folderManager';
import { FileNameGenerator } from '../pathService/fileNameGenerator';
import { PathManager } from '../pathService/pathManager';
import { FrontmatterConverter } from '../frontmatterService/frontmatterConverter';
import { FrontmatterCreator } from '../frontmatterService/frontmatterCreator';
import { TemplateProcessor } from '../templateService';

export class BookFileCreator {
	private app: App;
	private folderManager: FolderManager;
	private templateProcessor: TemplateProcessor;

	constructor(app: App) {
		this.app = app;
		this.folderManager = new FolderManager(app);
		this.templateProcessor = new TemplateProcessor();
	}

	async create(book: Book, baseFolder: string): Promise<TFile> {
		const booksFolder = PathManager.getBooksFolderPath(baseFolder);
		await this.folderManager.ensureFolder(booksFolder);

		const fileName = FileNameGenerator.generate(book.title);
		const filePath = normalizePath(`${booksFolder}/${fileName}.md`);
		const existingFile = this.app.vault.getAbstractFileByPath(filePath);
		
		if (existingFile instanceof TFile) {
			throw new Error(`Book note already exists: ${existingFile.path}`);
		}

		const frontmatter = FrontmatterConverter.bookToFrontmatter(book);
		const frontmatterString = FrontmatterCreator.create(frontmatter);
		const template = this.templateProcessor.getDefaultTemplate();
		const bodyContent = this.templateProcessor.processTemplate(template, book);
		const body = bodyContent.trim() || `# ${book.title}\n`;
		const content = `${frontmatterString}\n${body}`;

		return await this.app.vault.create(filePath, content);
	}
}
