import BookshelfPlugin from "../../../main";
import { LibraryBasesView } from "../libraryView";

export function buildLibraryViewFactory(plugin: BookshelfPlugin) {
	return (controller: any, containerEl: HTMLElement) => {
		return new LibraryBasesView(controller, containerEl, plugin);
	};
}
