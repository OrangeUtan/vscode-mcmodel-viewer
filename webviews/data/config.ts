import { writable } from 'svelte/store';

export class RendererSettings {
	constructor(
		public showBoundingBox = true,
		public showCardinalDirectionLabels = true,
		public show3x3BlocksGrid = true,
		public showVoxelGrid = true
	) {}
}

export const rendererSettingsStore = writable<RendererSettings>(new RendererSettings());