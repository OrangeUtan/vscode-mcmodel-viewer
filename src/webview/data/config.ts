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
	showBoundingBox: true,
	showCardinalDirectionLabels: true,
	show3x3BlocksGrid: true,
	showVoxelGrid: true,
	antiAliasing: 'SSAA'
});

extension.addExtensionMessageListener<UpdateOverlaySettingsMsg>(ExtensionMessageType.UpdateOverlaySettings, (msg) => {
	overlaySettings.set(msg.settings);
});
