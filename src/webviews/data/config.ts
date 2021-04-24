import { writable } from 'svelte/store';

export enum AntiAliasing {
	Off, SSAA
}

export class RendererSettings {
	public anitAliasing: AntiAliasing;

	constructor(
		public showBoundingBox = true,
		public showCardinalDirectionLabels = true,
		public show3x3BlocksGrid = true,
		public showVoxelGrid = true,
		anitAliasing = "Off",
	) {
		this.anitAliasing = AntiAliasing[anitAliasing as keyof typeof AntiAliasing]
	}
}

export const rendererSettingsStore = writable<RendererSettings>(new RendererSettings());