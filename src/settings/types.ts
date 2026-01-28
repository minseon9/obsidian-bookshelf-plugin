export interface BookshelfSettings {
	bookFolder: string;
	apiTimeout: number;
	searchResultLimit: number;
	defaultSort: 'date' | 'title' | 'author' | 'progress';
	autoUpdateTimestamp: boolean;
	autoStatusChange: boolean;
	showProgressNotification: boolean;
	trackReadingHistory: boolean;
	requireReadingNotes: boolean;
	defaultStatus: 'unread' | 'reading';
	timezone: number;
}

export const DEFAULT_SETTINGS: BookshelfSettings = {
	bookFolder: 'Bookshelf',
	apiTimeout: 5000,
	searchResultLimit: 20,
	defaultSort: 'date',
	autoUpdateTimestamp: true,
	autoStatusChange: true,
	showProgressNotification: true,
	trackReadingHistory: true,
	requireReadingNotes: false,
	defaultStatus: 'unread',
	timezone: 0,
};
