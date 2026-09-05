import { checkIsValidObject, checkMatchesObjectStructure } from "./typeSafety";
import * as Hammer from "hammerjs";

export interface Stringifiable {
    toString(): string;
}

// crypto
export function generateRandomToken(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    const string = array.join("");
    return string.substring(0, length);
}

// date
export function createTimestamp(): string {
    return new Date().toISOString();
}

// filters etc
export type StringEntryObject = { [key: string]: Stringifiable | undefined };

export function filterObjectsByStringEntries<T>(
    reference: StringEntryObject,
    converter: (object: T) => StringEntryObject,
    objects: T[],
): Set<T> {
    const matches: Set<T> = new Set();

    object_loop: for (const object of objects) {
        const doesMatch: boolean = checkDoesObjectMatchReference(
            reference,
            converter(object),
        );
        if (doesMatch) matches.add(object);
    }

    return matches;
}

export function checkDoesObjectMatchReference(
    reference: StringEntryObject,
    stringEntryObject: StringEntryObject,
    explicitEmptyValue: boolean = false,
): boolean {
    reference_entry_loop: for (const referenceEntry of Object.entries(
        reference,
    )) {
        const [referenceKey, referenceValue] = referenceEntry;
        const stringEntryObjectValue: Stringifiable | undefined =
            stringEntryObject[referenceKey];

        if (referenceValue == undefined) return false;

        if (referenceValue[0] == "-") {
            const strippedReferenceValue: string = referenceValue
                .toString()
                .substring(1);
            // property may not exist
            if (
                strippedReferenceValue == "" &&
                stringEntryObjectValue != undefined &&
                stringEntryObjectValue != ""
            ) {
                return false;
            }

            // property may not match
            if (stringEntryObjectValue == strippedReferenceValue) {
                return false;
            }
        } else {
            if (explicitEmptyValue == false) {
                // property must exist but be anything
                if (
                    referenceValue == "" &&
                    (stringEntryObjectValue == undefined ||
                        stringEntryObjectValue == "")
                ) {
                    return false;
                } else if (referenceValue == "") {
                    continue reference_entry_loop;
                }
            }

            // property must match
            if (stringEntryObjectValue != referenceValue) {
                return false;
            }
        }
    }
    return true;
}

export function collectObjectValuesForKey<T>(
    key: string,
    converter: (object: T) => StringEntryObject,
    objects: T[],
): string[] {
    const values: Set<string> = new Set();

    for (const object of objects) {
        const stringEntryObject: StringEntryObject = converter(object);
        const stringEntryObjectValue: Stringifiable | undefined =
            stringEntryObject[key];
        if (stringEntryObjectValue == undefined) continue;

        values.add(stringEntryObjectValue.toString());
    }

    return [...values.values()];
}

export function filterObjectsByWords<T>(
    query: string,
    getStringsOfObject: (object: T) => string[],
    objects: T[],
): Set<T> {
    const matches: Set<T> = new Set();

    object_loop: for (const object of objects) {
        const doesMatch: boolean = checkDoesObjectMatchSearch(
            query,
            getStringsOfObject,
            object,
        );
        if (doesMatch) matches.add(object);
    }

    return matches;
}

export function checkDoesObjectMatchSearch<T>(
    query: string,
    getStringsOfObject: (object: T) => string[],
    object: T,
): boolean {
    if (query == "") return true;

    const stringsInObject: string[] = getStringsOfObject(object);
    const wordsInObject: string[] = [];
    for (const string of stringsInObject) {
        const lowercaseWordsInString = string
            .toString()
            .toLowerCase()
            .split(" ")
            .filter((word) => word != "");
        wordsInObject.push(...lowercaseWordsInString);
    }

    const lowercaseWordsInQuery = query
        .toLowerCase()
        .split(" ")
        .filter((word) => word != "");
    for (const queryWord of lowercaseWordsInQuery) {
        if (queryWord[0] == "-") {
            // exclusion
            const wordContent = queryWord.substring(1);
            if (wordsInObject.includes(wordContent)) {
                return false;
            }
        } else {
            if (wordsInObject.includes(queryWord) == false) {
                return false;
            }
        }
    }

    return true;
}

// handlers
export type Handler<T> = (item: T) => void;

export class HandlerManager<T> {
    handlers = new Map<string, Handler<T>>();

    // manage
    setHandler = (id: string, handler: Handler<T>): void => {
        this.handlers.set(id, handler);
    };

    deleteHandler = (id: string): void => {
        this.handlers.delete(id);
    };

    // trigger
    trigger = (item: T): void => {
        [...this.handlers.values()].forEach((handler) => handler(item));
    };
}

// sorting
export class IndexManager<T> {
    private itemToString: (item: T) => string;

    sortedStrings: string[] = [];

    // methods
    update = (items: T[]): void => {
        this.sortedStrings = [];

        let strings: string[] = [];
        for (const item of items) {
            const string: string = this.itemToString(item);
            strings.push(string);
        }

        this.sortedStrings = strings.sort(localeCompare);
    };

    getIndex = (item: T): number => {
        const string: string = this.itemToString(item);
        const index: number = this.sortedStrings.indexOf(string);
        return index;
    };

    // init
    constructor(itemToString: (item: T) => string) {
        this.itemToString = itemToString;
    }
}

// storage
export function getLocalStorageItemAndClear(key: string): string | null {
    const value: string | null = localStorage.getItem(key);
    localStorage.removeItem(key);
    if (value != null) localStorage.setItem(`_${key}`, value);
    return value;
}

// string & parsing
export function stringify(data: any): string {
    return JSON.stringify(data, null, 4);
}

export function padZero(string: string | undefined, length: number): string {
    return (string ?? "").padStart(length, "0");
}

export function parse(string: string): any {
    try {
        return JSON.parse(string);
    } catch {
        return {};
    }
}

export function parseValidObject<T>(string: string, reference: T): T | null {
    const parsed: any = parse(string);
    if (checkIsValidObject(parsed) == false) return null;

    const doesMatchReference: boolean = checkMatchesObjectStructure(
        parsed,
        reference,
    );
    if (doesMatchReference == false) return null;

    return parsed;
}

export function parseOrFallback(inputString: string): any {
    try {
        return JSON.parse(inputString);
    } catch {
        return inputString;
    }
}

export function parseArray(inputString: string): any[] {
    const parsed: any = parseOrFallback(inputString);
    if (Array.isArray(parsed) == false) return [];
    return parsed;
}

// sort
export function localeCompare(a: string, b: string): number {
    return a.localeCompare(b);
}

// ui
export function implementPinchZoom(canvas: HTMLElement) {
    let pinching = false;
    let lastElement: HTMLElement | undefined = undefined;

    let initialDistance: number,
        currentZoom: number,
        initialZoom: number,
        currentX: number,
        currentY: number,
        initialX: number,
        initialY: number,
        initialTouchX: number,
        initialTouchY: number;

    function reset() {
        initialDistance = 0;

        currentZoom = 1;
        initialZoom = 1;

        currentX = 0;
        currentY = 0;
        initialX = 0;
        initialY = 0;
        initialTouchX = 0;
        initialTouchY = 0;
    }

    reset();

    const MIN = 0.25;
    const MAX = 5;

    const element = (): HTMLElement => canvas.querySelector(".zoom");
    const distance = (e: TouchEvent) =>
        Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY,
        );
    const point = (e: TouchEvent, direction: "x" | "y", i: number) =>
        e.touches[i][direction == "x" ? "clientX" : "clientY"];
    const midpoint = (e: TouchEvent, direction: "x" | "y") =>
        (point(e, direction, 0) + point(e, direction, 1)) / 2;

    function apply(factor: number, _offset?: [number, number]) {
        if (factor < MIN) return apply(MIN, _offset);
        if (factor > MAX) return apply(5, _offset);

	let x: number, y: number;
	if (_offset) [x, y] = _offset;
	else {
	    x = currentX
	    y = currentY
	}
	element().style.transform = `scale(${factor.toString()}) translate(${x}px, ${y}px)`;
	currentX = x;
	currentY = y;
	currentZoom = factor;
    }

    canvas.addEventListener("wheel", (event: WheelEvent) => {
	event.preventDefault();

	initialZoom = currentZoom;
	initialX = currentX;
	initialY = currentY;

	if (!event.shiftKey) {
	    apply(currentZoom, [
		currentX - event.deltaX,
		currentY - event.deltaY,
	    ]);
	    return;
	}
	apply(currentZoom - event.deltaY * 0.01);
    });
    canvas.addEventListener("scroll", (event: MouseEvent) => {
	event.preventDefault();
    });

    canvas.addEventListener("touchstart", (event: TouchEvent) => {
	(document.activeElement as HTMLElement).blur();

	if (lastElement != undefined && lastElement != element()) reset();
	lastElement = element();

	initialZoom = currentZoom;
	initialX = currentX;
	initialY = currentY;

	if (event.touches.length != 2) {
	    pinching = false;
	    initialTouchX = event.touches[0].clientX;
	    initialTouchY = event.touches[0].clientY;
	    return;
	}

	pinching = true;
	initialDistance = distance(event);
	initialTouchX = midpoint(event, "x");
	initialTouchY = midpoint(event, "y");
    });
    canvas.addEventListener("touchmove", (event: TouchEvent) => {
	if (!pinching) {
	    apply(currentZoom, [
		initialX +
		(event.touches[0].clientX - initialTouchX) / initialZoom,
		initialY +
		(event.touches[0].clientY - initialTouchY) / initialZoom,
	    ]);
	    return;
	}
	if (event.touches.length < 2) return;
	event.preventDefault();
	const currentDistance = distance(event);
	const midX = midpoint(event, "x");
	const midY = midpoint(event, "y");
	const ratio = currentDistance / initialDistance;
	const difference = currentDistance - initialDistance;
	apply(initialZoom * ratio, [
	    initialX + (midX - difference - initialTouchX) / initialZoom,
	    initialY + (midY - difference - initialTouchY) / initialZoom,
	]);
    });
}
