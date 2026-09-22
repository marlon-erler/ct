import * as React from "../react";

class Tracker<T> {
    state: React.State<T> | undefined;
}

class TrackerMap<T> {
    trackers = new Map<string, Tracker<T>>();

    private register = (key: string): Tracker<T>=> {
        if (this.trackers.has(key)) {
            return this.trackers.get(key)!;
        }
        const tracker = new Tracker<T>();
        this.trackers.set(key, tracker);
        return tracker;
    };

    setState = (
        key: string,
        stateBuilder: () => React.State<T>,
    ): React.State<T> | undefined => {
        const tracker: Tracker<T> = this.register(key);

        if (tracker.state != undefined) {
            return tracker.state;
        } else {
            tracker.state = stateBuilder();
            return tracker.state;
        }
    };
}

export class ViewController {
    static readonly chatPages = new Tracker<HTMLElement>();
    static readonly taskPages = new TrackerMap<HTMLElement>();
    static readonly boardPages = new TrackerMap<HTMLElement>();
    static readonly inlineReplies = new TrackerMap<HTMLElement>();

    static readonly scrollToView = (id: string) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.scrollIntoView();
        element.setAttribute("scrolled", "");
        setTimeout(() => element.removeAttribute("scrolled"), 1000);
    };

    static readonly allowDrop = (event: DragEvent) => {
        event.preventDefault();
    };

    static readonly allowDrag = (event: DragEvent) => {
        event.dataTransfer?.setData("text", "");
    };

    static readonly reload = () => {
        window.location.reload();
    };

    static readonly setFocus = () => {
        const focusedInModal = document.querySelector(
            ".modal[open] #focused",
        ) as HTMLElement;
        if (focusedInModal) return focusedInModal.focus();
        document.getElementById("focused")?.focus();
    };

    static readonly setFocusWithDelay = () => {
        setTimeout(this.setFocus, 100);
    };
}
