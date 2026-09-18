import { writable } from 'svelte/store';

export const DECK = writable([]);
export const SEALED_CARDS = writable([]);
export const DECK_EVENT = writable(0);
