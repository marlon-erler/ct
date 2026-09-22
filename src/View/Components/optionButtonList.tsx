import * as React from "../../react";
import { OptionButton } from "./optionButton";

export function OptionButtonList<T>(
    options: React.ListState<[string, T]>,
    selection: React.State<T>,
) {
    function OptionToView(option: [string, T]) {
        const [text, value] = option;
        return OptionButton(text, value, selection);
    }

    return (
        <div
            class="flex-column gap"
            children:append={[options, OptionToView]}
        ></div>
    );
}
