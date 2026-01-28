import BookshelfPlugin from "../../../main";
import { BookshelfBasesView } from "../bookshelfView";

export function buildBookshelfViewFactory(plugin: BookshelfPlugin) {
	return (controller: any, containerEl: HTMLElement) => {
		return new BookshelfBasesView(controller, containerEl, plugin);
	};
}
