import type { ExtensionMessage } from "../extension/messages";
import { ExtensionMessageType } from "../extension/messages";
import { ViewerMessageType } from './messages';
import type { ViewerMessage } from './messages';

export const vscode = acquireVsCodeApi();

export function showError(text: string) {
    vscode.postMessage({command: ViewerMessageType.Error, text} as ViewerMessage);
}

type OnResolve = (assets: {[assetPath: string]: string | null}) => void;

export class AssetResolver {
    private static assetRequests: {[key: number]: OnResolve} = {};
    private static currentRequestID = 0;

    static async resolveAssets(assetPaths: string[], assetType: string) {
        return await new Promise((resolve: (assets: {[assetPath: string]: string | null}) => void) => this._resolveAsset(assetPaths, assetType, resolve));
    }

    private static _resolveAsset(assetPaths: string[], assetType: string, onResolved: OnResolve) {
        const requestId = this.currentRequestID++;
        vscode.postMessage({command: ViewerMessageType.ResolveAssets, assetPaths, assetType, requestId} as ViewerMessage);
        AssetResolver.assetRequests[requestId] = onResolved;
    }

    static onResolvedAssets(requestID: number, assets: any) {
        const cb = this.assetRequests[requestID];
        if(cb != null) {
            delete this.assetRequests[requestID];
            cb(assets || []);
        }
    }
}

/*
    Listen to Extension messages
*/

export type ExtensionMessageListener<Message extends ExtensionMessage> = (msg: Message) => void;
const extensionMessageListeners: {[messageType: string]: ExtensionMessageListener<ExtensionMessage>[]} = {};

export function addExtensionMessageListener<Message extends ExtensionMessage>(messageType: ExtensionMessageType, listener: ExtensionMessageListener<Message>) {
    const listeners = extensionMessageListeners[messageType] ?? [];
    listeners.push(listener as ExtensionMessageListener<ExtensionMessage>);
    extensionMessageListeners[messageType] = listeners;
}

export function removeExtensionMessageListener(messageType: ExtensionMessageType, listener: ExtensionMessageListener<ExtensionMessage>) {
    let listeners = extensionMessageListeners[messageType] ?? [];
    listeners = listeners.filter(l => l !== listener);
    extensionMessageListeners[messageType] = listeners;
}

export function onExtensionMessage(msg: ExtensionMessage) {
    notifyExtensionMessageListeners(msg.command, msg);

    switch(msg.command) {
        case ExtensionMessageType.ResolvedAssets:
            AssetResolver.onResolvedAssets(msg.requestId, msg.assets);
            break;
    }
}

function notifyExtensionMessageListeners(messageType: ExtensionMessageType, msg: ExtensionMessage) {
    extensionMessageListeners[messageType]?.forEach(l => l(msg));
}