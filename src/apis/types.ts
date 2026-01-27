/**
 * Open Library API response type definitions
 */

/**
 * Open Library search result document type
 */
export interface OpenLibrarySearchDoc {
	key: string;
	type: string;
	seed: string[];
	title: string;
	title_suggest: string;
	title_sort: string;
	edition_count: number;
	edition_key: string[];
	publish_date: string[];
	publish_year: number[];
	first_publish_year?: number;
	number_of_pages_median?: number;
	lccn?: string[];
	publish_place?: string[];
	oclc?: string[];
	isbn?: string[];
	contributor?: string[];
	lcc?: string[];
	ddc?: string[];
	lcc_sort?: string;
	author_key?: string[];
	author_name?: string[];
	author_alternative_name?: string[];
	subject?: string[];
	subject_key?: string[];
	subject_facet?: string[];
	place?: string[];
	place_key?: string[];
	place_facet?: string[];
	person?: string[];
	person_key?: string[];
	person_facet?: string[];
	time?: string[];
	time_key?: string[];
	time_facet?: string[];
	publisher?: string[];
	publisher_facet?: string[];
	publisher_key?: string[];
	language?: string[];
	language_key?: string[];
	language_facet?: string[];
	ia?: string[];
	ia_collection?: string[];
	ia_collection_s?: string[];
	lending_edition_s?: string;
	lending_identifier_s?: string;
	printdisabled_s?: string;
	cover_edition_key?: string;
	cover_i?: number;
	first_sentence?: string[];
	has_fulltext?: boolean;
	public_scan_b?: boolean;
	ia_box_id?: string[];
	ratings_average?: number;
	ratings_sortable?: number;
	ratings_count?: number;
	ratings_count_1?: number;
	ratings_count_2?: number;
	ratings_count_3?: number;
	ratings_count_4?: number;
	ratings_count_5?: number;
	readinglog_count?: number;
	want_to_read_count?: number;
	currently_reading_count?: number;
	already_read_count?: number;
	subtitle?: string;
}

/**
 * Open Library search API response
 */
export interface OpenLibrarySearchResponse {
	start: number;
	num_found: number;
	docs: OpenLibrarySearchDoc[];
}

/**
 * Open Library Work detail information
 */
export interface OpenLibraryWork {
	key: string;
	title: string;
	subtitle?: string;
	description?: string | { type: string; value: string };
	authors?: Array<{ key: string; name: string }>;
	subjects?: string[];
	publishers?: string[];
	publish_date?: string;
	number_of_pages?: number;
	isbn_10?: string[];
	isbn_13?: string[];
	covers?: number[];
	first_sentence?: { type: string; value: string };
	excerpts?: Array<{ type: string; value: string }>;
}

/**
 * Open Library Edition detail information
 */
export interface OpenLibraryEdition {
	key: string;
	title: string;
	subtitle?: string;
	authors?: Array<{ key: string; name: string }>;
	publishers?: string[];
	publish_date?: string;
	number_of_pages?: number;
	isbn_10?: string[];
	isbn_13?: string[];
	covers?: number[];
	subjects?: string[];
}
