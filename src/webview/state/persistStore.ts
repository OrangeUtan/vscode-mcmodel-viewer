import { Writable, writable } from "svelte/store";
import * as state from './state';

export interface PersistStore<T> extends Writable<T> {}

export function persistStore<T>(key: string, initial: T) {
    const data = state.getItem(key) ?? initial;

    const store: PersistStore<T> = writable<T>(data, () => {
        const unsubscribe = store.subscribe((value: T) => {
            state.setItem(key, value);
        });
        return unsubscribe;
    });

    return store;
};