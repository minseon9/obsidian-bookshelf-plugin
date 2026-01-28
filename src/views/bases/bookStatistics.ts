export interface BookStatistics {
	totalBooks: number;
	reading: number;
	unread: number;
	finished: number;
	totalPages: number;
	readPages: number;
	averageTimeToFinish: number;
	categoryCounts: Record<string, number>;
	yearlyStats: Record<string, { count: number; pages: number; change?: number; changePercent?: number }>;
	monthlyStats: Record<string, { count: number; pages: number; change?: number; changePercent?: number }>;
	readingDays: number;
}
