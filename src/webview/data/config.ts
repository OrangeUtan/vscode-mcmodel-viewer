import { writable } from 'svelte/store';
import { ExtensionMessageType, UpdateOverlaySettingsMsg } from '../../extension/messages';
import * as extension from '../extension';

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

export const overlaySettings = writable<OverlaySettings>({
	showBoundingBox: false,
	showCardinalDirectionLabels: false,
	show3x3BlocksGrid: false,
	showVoxelGrid: false,
	antiAliasing: 'SSAA'
});

extension.addExtensionMessageListener<UpdateOverlaySettingsMsg>(ExtensionMessageType.UpdateOverlaySettings, (msg) => {
	overlaySettings.set(msg.settings);
});
