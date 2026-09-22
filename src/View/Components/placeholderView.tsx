import * as React from "../../react";

export function PlaceholderView(text: string) {
    return (
        <div class="width-100 height-100 flex-column justify-center align-center">
            <span class="secondary slide-up">{text}</span>
        </div>
    );
}
