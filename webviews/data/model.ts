import type { MinecraftModelMesh } from '@oran9e/three-mcmodel';
import { writable } from 'svelte/store';

export const modelStore = writable<MinecraftModelMesh | undefined>(undefined);
export const texturesStore = writable<{[textureVariabel: string] : string} | undefined>(undefined);