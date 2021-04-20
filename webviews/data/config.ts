import { writable } from 'svelte/store';

export class HelperConfiguration {
	constructor(
		public showBoundingBox = true,
		public showCardinalDirectionLabeles = true,
		public show3x3BlocksGrid = true,
		public showVoxelGrid = true
	) {}
}

export const helpersCfgStore = writable<HelperConfiguration>(new HelperConfiguration());