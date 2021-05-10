import { vscode } from '../extension';
import * as config from './config';
import { get } from 'svelte/store';

export interface State {
	overlaySettings: config.OverlaySettings
}

export function loadState() {
    const state = vscode.getState() as State | undefined;
    if(!state) return;

    config.overlaySettings.set(state.overlaySettings);
}

function saveState() {
    const state: State = {
        overlaySettings: get(config.overlaySettings)
    };
    vscode.setState(state);
}

loadState();
config.overlaySettings.subscribe(_ => saveState());