import { vscode } from '../extension';

export function getItem(key: string) {
    const state = vscode.getState() ?? {};
    return state[key];
}

export function setItem(key: string, value: any) {
    const state = vscode.getState() ?? {};
    state[key] = value;
    vscode.setState(state);
}
