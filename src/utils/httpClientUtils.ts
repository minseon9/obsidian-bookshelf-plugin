import { requestUrl } from 'obsidian';

/**
 * HTTP client for making requests with timeout and error handling
 */
export class HttpClient {
	private timeout: number;

	constructor(timeout: number = 5000) {
		this.timeout = timeout;
	}

	/**
	 * Make GET request and parse JSON response using Obsidian's requestUrl
	 * @param url Request URL
	 * @returns Parsed JSON data
	 * @throws Error if request fails or response is not valid JSON
	 */
	async get<T>(url: string): Promise<T> {
		try {
			const response = await requestUrl({
				url,
				method: 'GET',
				throw: false,
			});

			if (response.status >= 400) {
				throw new Error(`Request failed with status ${response.status}`);
			}

			return response.json as T;
		} catch {
			throw new Error(`Request failed. Please try again later.`);
		}
	}
}
