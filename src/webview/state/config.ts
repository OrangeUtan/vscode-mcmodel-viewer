import { ExtensionMessageType, UpdateOverlaySettingsMsg } from '../../extension/messages';
import * as extension from '../extension';
import { persistStore } from './persistStore';

export const defaultOverlaySettings: OverlaySettings = {
	showBoundingBox: false,
	showCardinalDirectionLabels: false,
	show3x3BlocksGrid: false,
	showVoxelGrid: false,
	antiAliasing: 'SSAA'
};

export const overlaySettings = persistStore<OverlaySettings>("overlaySettings", defaultOverlaySettings);

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


