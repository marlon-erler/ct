export enum CommonKeys {
    Home = "w",
    Filter = "=",
    Reset = "-",
    Options = ".",
    CloseOrCancel = "backspace",
    Apply = "enter",
    Settings = ",",
    Create = "a",
}

export function getKeySymbol(keystroke: string): string {
    switch (keystroke) {
        case "backspace":
            return "⌫";
        case "enter":
            return "⏎";
        default:
            return keystroke;
    }
}
