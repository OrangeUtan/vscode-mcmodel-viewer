import { ExtensionMessageType, UpdateOverlaySettingsMsg } from '../../extension/messages';
import { writable } from 'svelte/store';
import * as extension from '../extension';

export const defaultOverlaySettings: OverlaySettings = {
	showBoundingBox: false,
	showCardinalDirectionLabels: false,
	show3x3BlocksGrid: false,
	showVoxelGrid: false,
	antiAliasing: 'SSAA'
};

export const overlaySettings = writable<OverlaySettings>(defaultOverlaySettings);

extension.addExtensionMessageListener<UpdateOverlaySettingsMsg>(ExtensionMessageType.UpdateOverlaySettings, (msg) => {
    overlaySettings.set(msg.settings);
});

export enum AntiAliasing {
	Off = "Off",
	SSAA = "SSAA"
}

export interface OverlaySettings {
	showBoundingBox: boolean
	showCardinalDirectionLabels: boolean
	show3x3BlocksGrid: boolean
	showVoxelGrid: boolean
	antiAliasing: keyof typeof AntiAliasing
}


