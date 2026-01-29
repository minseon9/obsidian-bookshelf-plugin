/**
 * Open Library API response type definitions
 * Based on official API documentation: https://openlibrary.org/dev/docs/api/search
 */

/**
 * Open Library search result document type
 * Based on actual API response structure
 */
export interface OpenLibrarySearchDoc {
	key: string;
	title: string;
	author_key?: string[];
	author_name?: string[];
	cover_edition_key?: string;
	cover_i?: number;
	edition_count?: number;
	first_publish_year?: number;
	number_of_pages_median?: number;
	number_of_pages?: number;
	publish_date?: string[];
	publish_year?: number[];
	publisher?: string[];
	// Note: Search API does not include isbn field in response
	// ISBN information is only available through Books API (/books/{olid}.json or /isbn/{isbn}.json)
	language?: string[];
	subject?: string[];
	subtitle?: string;
	ebook_access?: string;
	has_fulltext?: boolean;
	public_scan_b?: boolean;
	ia?: string[];
	ia_collection?: string[];
	lending_edition_s?: string;
	lending_identifier_s?: string;
	printdisabled_s?: string;
	ratings_average?: number;
	ratings_count?: number;
	readinglog_count?: number;
	want_to_read_count?: number;
	currently_reading_count?: number;
	already_read_count?: number;
	id_standard_ebooks?: string[];
	id_librivox?: string[];
	id_project_gutenberg?: string[];
}

/**
 * Open Library search API response
 * Based on actual API response structure
 */
export interface OpenLibrarySearchResponse {
	numFound: number;
	num_found: number;
	start: number;
	docs: OpenLibrarySearchDoc[];
	documentation_url?: string;
	q?: string;
	offset?: number | null;
	numFoundExact?: boolean;
}

/**
 * Open Library Work detail information
 * Based on actual API response structure
 */
export interface OpenLibraryWork {
	key: string;
	title: string;
	subtitle?: string;
	description?: string | { type: string; value: string };
	authors?: Array<{
		author: {
			key: string;
		};
		type: {
			key: string;
		};
	}>;
	subjects?: string[];
	subject_places?: string[];
	subject_people?: string[];
	subject_times?: string[];
	publishers?: string[];
	publish_date?: string;
	number_of_pages?: number;
	isbn_10?: string[];
	isbn_13?: string[];
	covers?: number[];
	first_sentence?: { type: string; value: string } | string;
	excerpts?: Array<{ type: string; value: string; comment?: string; author?: { key: string } }>;
	links?: Array<{
		title: string;
		url: string;
		type: {
			key: string;
		};
	}>;
	type?: {
		key: string;
	};
	created?: {
		type: string;
		value: string;
	};
	last_modified?: {
		type: string;
		value: string;
	};
	latest_revision?: number;
	revision?: number;
}

/**
 * Open Library Edition detail information
 * Based on actual API response structure from /books/{olid}.json
 * Example: https://openlibrary.org/books/OL25910450M.json
 */
export interface OpenLibraryEdition {
	key: string; // e.g., "/books/OL25910450M"
	title: string;
	subtitle?: string;
	description?: string;
	authors?: Array<{
		key: string;
		name?: string;
	}>;
	publishers?: string[];
	publish_date?: string;
	number_of_pages?: number; // This is the key field for total pages
	isbn_10?: string[];
	isbn_13?: string[];
	covers?: number[];
	subjects?: string[];
	works?: Array<{
		key: string;
	}>;
	type?: {
		key: string;
	};
	identifiers?: {
		goodreads?: string[];
		librarything?: string[];
		[key: string]: string[] | undefined;
	};
	ocaid?: string;
	languages?: Array<{
		key: string;
	}>;
	contributors?: Array<{
		role?: string;
		name?: string;
	}>;
	source_records?: string[];
	local_id?: string[];
	first_sentence?: {
		type: string;
		value: string;
	} | string;
	classifications?: Record<string, unknown>;
	lc_classifications?: string[];
	physical_format?: string;
	oclc_numbers?: string[];
	lccn?: string[];
	created?: {
		type: string;
		value: string;
	};
	last_modified?: {
		type: string;
		value: string;
	};
	latest_revision?: number;
	revision?: number;
}
