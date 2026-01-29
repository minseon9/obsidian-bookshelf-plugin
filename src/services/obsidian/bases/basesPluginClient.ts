import {App, Plugin} from "obsidian";
import {BasesAPI, BasesViewRegistration} from "./basesTypes";

interface InternalPluginsManager {
	getEnabledPluginById?: (id: string) => BasesInternalPlugin | undefined;
	[key: string]: unknown;
}

interface BasesInternalPlugin {
	registrations?: Record<string, BasesViewRegistration>;
	manifest?: {
		version?: string;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

interface AppWithInternals extends App {
	internalPlugins?: InternalPluginsManager;
}

export function getBasesAPI(app: App): BasesAPI | null {
	try {
		const appWithInternals = app as AppWithInternals;
		const internalPlugins = appWithInternals.internalPlugins;
		if (!internalPlugins) {
			console.debug("[Bookshelf][Bases] Internal plugins manager not available");
			return null;
		}

		const basesPlugin = internalPlugins.getEnabledPluginById?.("bases");
		if (!basesPlugin) {
			console.debug("[Bookshelf][Bases] Bases plugin not found or not enabled");
			return null;
		}

		if (!basesPlugin.registrations || typeof basesPlugin.registrations !== "object") {
			console.warn(
				"[Bookshelf][Bases] Bases plugin found but registrations API not available"
			);
			return null;
		}

		return {
			registrations: basesPlugin.registrations,
			isEnabled: true,
			version: basesPlugin.manifest?.version || "unknown",
		};
	} catch (error) {
		console.warn("[Bookshelf][Bases] Error accessing Bases plugin API:", error);
		return null;
	}
}

interface PluginWithBasesAPI {
	registerBasesView?: (viewId: string, registration: BasesViewRegistration) => boolean;
}

export function registerBasesView(
	plugin: Plugin,
	viewId: string,
	registration: BasesViewRegistration
): boolean {
	const pluginWithAPI = plugin as unknown as PluginWithBasesAPI;
	if (typeof pluginWithAPI.registerBasesView === "function") {
		try {
			const success = pluginWithAPI.registerBasesView(viewId, registration);
			if (success) {
				console.debug(
					`[Bookshelf][Bases] Successfully registered view via public API: ${viewId}`
				);
				return true;
			}
			console.debug(
				`[Bookshelf][Bases] Public API returned false (Bases may be disabled)`
			);
			return false;
		} catch (error) {
			const err = error as Error;
			if (err?.message?.includes("already exists")) {
				console.debug(
					`[Bookshelf][Bases] View ${viewId} already registered via public API`
				);
				return true;
			}
			console.warn(
				`[Bookshelf][Bases] Public API registration failed for ${viewId}:`,
				error
			);
			return false;
		}
	}

	console.warn("[Bookshelf][Bases] Cannot register view: Bases public API not available (requires Obsidian 1.10.0+)");
	return false;
}

export function unregisterBasesView(plugin: Plugin, viewId: string): boolean {
	const api = getBasesAPI(plugin.app);
	if (!api) {
		return true;
	}

	try {
		if (api.registrations[viewId]) {
			delete api.registrations[viewId];
		}
		return true;
	} catch (error) {
		console.error(`[Bookshelf][Bases] Error unregistering view ${viewId}:`, error);
		return false;
	}
}
